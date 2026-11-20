import { LOCALSTORAGE_HISTORY } from '@shared/constants/storage.constant';
import { RateHistory } from '@shared/models/DailyClose';
import { getLocalStorage, lastUpdatedKey, setLocalStorage } from '@shared/utils/storage.util';
import { HistoryService } from './history.service';

const SERIE = [
	{ fecha: '2026-11-17', compra: 1580, venta: 1600 },
	{ fecha: '2026-11-18', compra: 1585, venta: 1605 },
	{ fecha: '2026-11-19', compra: 1610, venta: 1630 },
];

/** Responde distinto según la URL, que es lo que distingue una casa de otra. */
function respondWith(porUrl: (url: string) => unknown, ok = true): jasmine.Spy {
	return spyOn(window, 'fetch').and.callFake((input: RequestInfo | URL) =>
		Promise.resolve({
			ok,
			status: ok ? 200 : 500,
			statusText: ok ? 'OK' : 'Server Error',
			json: async () => porUrl(String(input)),
		} as Response),
	);
}

describe('HistoryService', () => {
	let service: HistoryService;

	beforeEach(() => {
		service = new HistoryService();
	});

	it('trae una serie por casa y la guarda', async () => {
		respondWith(() => SERIE);

		const history = await service.getAll(['blue', 'oficial']);

		expect(Object.keys(history)).toEqual(['blue', 'oficial']);
		expect(history['blue'].length).toBe(3);
		expect((await getLocalStorage<RateHistory>(LOCALSTORAGE_HISTORY))!['blue'][0].venta).toBe(1600);
	});

	// Los dólares cuelgan de /dolares/<casa>; las otras monedas, de /<moneda>.
	it('arma la URL según la moneda', async () => {
		const fetchSpy = respondWith(() => SERIE);

		await service.getAll(['blue', 'eur']);

		const urls = fetchSpy.calls.allArgs().map(([input]) => String(input));
		expect(urls.some((url) => url.endsWith('/dolares/blue'))).toBeTrue();
		expect(urls.some((url) => url.endsWith('/cotizaciones/eur'))).toBeTrue();
	});

	it('usa lo guardado si tiene menos de seis horas', async () => {
		await setLocalStorage(LOCALSTORAGE_HISTORY, { blue: SERIE });
		const fetchSpy = respondWith(() => SERIE);

		const history = await service.getAll(['blue']);

		expect(fetchSpy).not.toHaveBeenCalled();
		expect(history['blue'].length).toBe(3);
	});

	// Si entra una casa nueva (por ejemplo al activar otras monedas) hay que
	// salir a buscarla aunque lo guardado esté fresco.
	it('pide de nuevo si falta una casa, aunque el caché esté fresco', async () => {
		await setLocalStorage(LOCALSTORAGE_HISTORY, { blue: SERIE });
		const fetchSpy = respondWith(() => SERIE);

		await service.getAll(['blue', 'eur']);

		expect(fetchSpy).toHaveBeenCalled();
	});

	it('vuelve a pedir cuando el caché venció', async () => {
		await setLocalStorage(LOCALSTORAGE_HISTORY, { blue: SERIE });
		await chrome.storage.local.set({ [lastUpdatedKey(LOCALSTORAGE_HISTORY)]: Date.now() - 7 * 60 * 60 * 1000 });
		const fetchSpy = respondWith(() => SERIE);

		await service.getAll(['blue']);

		expect(fetchSpy).toHaveBeenCalled();
	});

	// El histórico es información de apoyo: si el servicio se cae, la tabla
	// tiene que seguir andando.
	it('no tira si la API falla y conserva lo que ya tenía', async () => {
		await setLocalStorage(LOCALSTORAGE_HISTORY, { blue: SERIE });
		await chrome.storage.local.set({ [lastUpdatedKey(LOCALSTORAGE_HISTORY)]: Date.now() - 7 * 60 * 60 * 1000 });
		spyOn(window, 'fetch').and.rejectWith(new Error('sin red'));

		const history = await service.getAll(['blue']);

		expect(history['blue'].length).toBe(3);
	});

	it('descarta las entradas con forma inesperada', async () => {
		respondWith(() => [
			{ fecha: '2026-11-18', compra: 1585, venta: 1605 },
			{ fecha: 'ayer', compra: 1, venta: 2 },
			{ compra: 1 },
			null,
		]);

		const history = await service.getAll(['blue']);

		expect(history['blue'].length).toBe(1);
	});

	it('ordena por fecha y se queda con los últimos treinta cierres', async () => {
		const larga = Array.from({ length: 40 }, (_, index) => ({
			fecha: `2026-10-${String(40 - index).padStart(2, '0')}`,
			compra: 1000 + index,
			venta: 1100 + index,
		})).filter((close) => close.fecha <= '2026-10-31');
		respondWith(() => larga);

		const history = await service.getAll(['blue']);

		expect(history['blue'].length).toBe(30);
		expect(history['blue'][0].fecha < history['blue'][29].fecha).toBeTrue();
	});
});
