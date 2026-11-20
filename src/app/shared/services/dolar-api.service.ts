import { LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLastUpdated, getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';
import { ENDPOINT, ENDPOINT_OTHER_CURRENCIES } from '@shared/constants/api.constant';
import { OTHER_CURRENCIES } from '@shared/constants/currencies.constant';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const REQUEST_TIMEOUT_MS = 8 * 1000; // 8 segundos

/**
 * Sin `@Injectable`: este servicio también corre en el service worker y el
 * decorador arrastraría @angular/core al bundle del background. Se provee a
 * mano en los `providers` de PopupComponent.
 */
export class DolarAPIService {
	private abortController: AbortController | null = null;

	/**
	 * @param otherCurrencies suma euro, real, peso chileno y peso uruguayo.
	 */
	async getAll(forceRefresh = false, otherCurrencies = false): Promise<ExchangeRate[]> {
		if (!forceRefresh) {
			const cached = await this.getCachedRates();
			// Lo cacheado puede ser de antes de prender (o apagar) las otras
			// monedas: en ese caso no sirve aunque esté fresco.
			if (cached && this.matchesPreference(cached, otherCurrencies)) return cached;
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

			if (otherCurrencies) {
				// Las otras monedas son un extra: si ese pedido falla, los dólares
				// se muestran igual.
				rates.push(...(await this.fetchOtherCurrencies(controller.signal).catch(() => [])));
			}

			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, rates);
			return rates;
		} catch (error: unknown) {
			if (error instanceof Error && error.name === 'AbortError') {
				throw error;
			}
			const fallback = await getLocalStorage<ExchangeRate[]>(LOCALSTORAGE_EXCHANGERATES);
			if (fallback?.length) return fallback;
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`No se pudo obtener la cotización.\n${message}`, { cause: error });
		} finally {
			clearTimeout(timeout);
			if (this.abortController === controller) {
				this.abortController = null;
			}
		}
	}

	/**
	 * Euro, real, peso chileno y peso uruguayo. Vienen todas con casa "oficial",
	 * así que se las identifica por el código de moneda; el dólar se descarta
	 * porque ya está en la lista principal.
	 */
	private async fetchOtherCurrencies(signal: AbortSignal): Promise<ExchangeRate[]> {
		const response = await fetch(ENDPOINT_OTHER_CURRENCIES, { signal });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const payload: unknown = await response.json();
		if (!Array.isArray(payload)) return [];

		return payload
			.filter((item): item is RatePayload & { moneda: string } => isRatePayload(item) && typeof item.moneda === 'string')
			.filter((item) => OTHER_CURRENCIES.includes(item.moneda.toLowerCase()))
			.map(
				(item) =>
					new ExchangeRate(
						item.moneda.toLowerCase(),
						typeof item.nombre === 'string' ? item.nombre : item.moneda,
						Number(item.compra),
						Number(item.venta),
						typeof item.fechaActualizacion === 'string' ? item.fechaActualizacion : undefined,
					),
			);
	}

	private matchesPreference(rates: ExchangeRate[], otherCurrencies: boolean): boolean {
		return rates.some((rate) => OTHER_CURRENCIES.includes(rate.casa)) === otherCurrencies;
	}

	/** Descarta lo que no tenga la forma esperada: la respuesta es data de terceros. */
	private parseRates(payload: unknown): ExchangeRate[] {
		if (!Array.isArray(payload)) {
			throw new Error('La respuesta de la API no tiene el formato esperado.');
		}

		const rates = payload
			.filter(isRatePayload)
			.map(
				(item) =>
					new ExchangeRate(
						item.casa,
						typeof item.nombre === 'string' ? item.nombre : item.casa,
						Number(item.compra),
						Number(item.venta),
						typeof item.fechaActualizacion === 'string' ? item.fechaActualizacion : undefined,
					),
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
		const cached = await getLocalStorage<ExchangeRate[]>(LOCALSTORAGE_EXCHANGERATES);
		return cached?.length ? cached : null;
	}
}

/** Forma mínima que tiene que tener cada entrada de la API para ser usable. */
interface RatePayload {
	casa: string;
	moneda?: unknown;
	nombre?: unknown;
	compra: unknown;
	venta: unknown;
	fechaActualizacion?: unknown;
}

function isRatePayload(item: unknown): item is RatePayload {
	if (!item || typeof item !== 'object') return false;
	const candidate = item as Record<string, unknown>;
	return (
		typeof candidate['casa'] === 'string' && Number.isFinite(Number(candidate['compra'])) && Number.isFinite(Number(candidate['venta']))
	);
}
