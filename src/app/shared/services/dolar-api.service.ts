import { LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLastUpdated, getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';
import { ENDPOINT } from '@shared/constants/api.constant';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const REQUEST_TIMEOUT_MS = 8 * 1000; // 8 segundos

/**
 * Sin `@Injectable`: este servicio también corre en el service worker y el
 * decorador arrastraría @angular/core al bundle del background.
 * Se provee a mano en PopupModule.
 */
export class DolarAPIService {
	private abortController: AbortController | null = null;

	async getAll(forceRefresh = false): Promise<ExchangeRate[]> {
		if (!forceRefresh) {
			const cached = await this.getCachedRates();
			if (cached) return cached;
		}

		this.abortController?.abort();
		const controller = new AbortController();
		this.abortController = controller;
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(ENDPOINT, { signal: controller.signal });
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			const rates = this.parseRates(await response.json());
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, rates);
			return rates;
		} catch (error: any) {
			if (error?.name === 'AbortError') {
				throw error;
			}
			const fallback = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);
			if (fallback?.length) return fallback;
			throw new Error(`No se pudo obtener la cotización.\n${error?.message ?? error}`);
		} finally {
			clearTimeout(timeout);
			if (this.abortController === controller) {
				this.abortController = null;
			}
		}
	}

	/** Descarta lo que no tenga la forma esperada: la respuesta es data de terceros. */
	private parseRates(payload: unknown): ExchangeRate[] {
		if (!Array.isArray(payload)) {
			throw new Error('La respuesta de la API no tiene el formato esperado.');
		}

		const rates = payload
			.filter(
				(item: any) =>
					!!item &&
					typeof item.casa === 'string' &&
					Number.isFinite(Number(item.compra)) &&
					Number.isFinite(Number(item.venta))
			)
			.map(
				(item: any) =>
					new ExchangeRate(
						item.casa,
						typeof item.nombre === 'string' ? item.nombre : item.casa,
						Number(item.compra),
						Number(item.venta),
						item.fechaActualizacion
					)
			);

		if (!rates.length) {
			throw new Error('La respuesta de la API no trajo cotizaciones válidas.');
		}

		return rates;
	}

	private async getCachedRates(): Promise<ExchangeRate[] | null> {
		const lastUpdated = await getLastUpdated(LOCALSTORAGE_EXCHANGERATES);
		if (!lastUpdated) return null;
		if (Date.now() - lastUpdated > CACHE_TTL_MS) return null;
		const cached = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);
		return cached?.length ? cached : null;
	}
}
