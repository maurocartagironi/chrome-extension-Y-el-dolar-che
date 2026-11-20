import { ENDPOINT_HISTORY } from '@shared/constants/api.constant';
import { LOCALSTORAGE_HISTORY } from '@shared/constants/storage.constant';
import { DailyClose, RateHistory } from '@shared/models/DailyClose';
import { getLastUpdated, getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';

/** Los cierres cambian una vez por día: no hace falta pedirlos más seguido. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8 * 1000;
/** Lo que se guarda por casa. Alcanza para el sparkline y la variación. */
const MAX_POINTS = 30;

/**
 * Las monedas que no son dólar cuelgan directo de /cotizaciones; los dólares,
 * de /cotizaciones/dolares.
 */
const OTHER_CURRENCIES = ['eur', 'brl', 'clp', 'uyu'];

/**
 * Serie histórica de cierres diarios.
 *
 * Sin `@Injectable` por lo mismo que DolarAPIService: el decorador arrastraría
 * @angular/core al bundle del service worker.
 */
export class HistoryService {
	/**
	 * Devuelve los cierres de cada casa pedida. Nunca tira: el histórico es
	 * información de apoyo, si falla la tabla tiene que seguir andando.
	 */
	async getAll(casas: string[]): Promise<RateHistory> {
		const stored = (await getLocalStorage<RateHistory>(LOCALSTORAGE_HISTORY)) ?? {};

		if ((await this.isFresh()) && casas.every((casa) => stored[casa]?.length)) {
			return stored;
		}

		const series = await Promise.all(casas.map((casa) => this.fetchSeries(casa).catch(() => stored[casa] ?? [])));

		const history: RateHistory = { ...stored };
		casas.forEach((casa, index) => {
			const serie = series[index];
			if (serie?.length) history[casa] = serie;
		});

		if (Object.keys(history).length) {
			await setLocalStorage(LOCALSTORAGE_HISTORY, history);
		}

		return history;
	}

	private async isFresh(): Promise<boolean> {
		const lastUpdated = await getLastUpdated(LOCALSTORAGE_HISTORY);
		return lastUpdated !== null && Date.now() - lastUpdated <= CACHE_TTL_MS;
	}

	private async fetchSeries(casa: string): Promise<DailyClose[]> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(this.urlFor(casa), { signal: controller.signal });
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			return this.parseSeries(await response.json());
		} finally {
			clearTimeout(timeout);
		}
	}

	private urlFor(casa: string): string {
		return OTHER_CURRENCIES.includes(casa) ? `${ENDPOINT_HISTORY}/${casa}` : `${ENDPOINT_HISTORY}/dolares/${casa}`;
	}

	/** La respuesta es data de terceros: se descarta lo que no tenga la forma esperada. */
	private parseSeries(payload: unknown): DailyClose[] {
		if (!Array.isArray(payload)) return [];

		return payload
			.filter(isDailyClosePayload)
			.map((item) => ({
				fecha: item.fecha,
				compra: Number(item.compra),
				venta: Number(item.venta),
			}))
			.sort((a, b) => a.fecha.localeCompare(b.fecha))
			.slice(-MAX_POINTS);
	}
}

interface DailyClosePayload {
	fecha: string;
	compra: unknown;
	venta: unknown;
}

function isDailyClosePayload(item: unknown): item is DailyClosePayload {
	if (!item || typeof item !== 'object') return false;
	const candidate = item as Record<string, unknown>;
	return (
		typeof candidate['fecha'] === 'string' &&
		/^\d{4}-\d{2}-\d{2}$/.test(candidate['fecha']) &&
		Number.isFinite(Number(candidate['compra'])) &&
		Number.isFinite(Number(candidate['venta']))
	);
}
