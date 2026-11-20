import { LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { getLocalStorage, lastUpdatedKey, setLocalStorage } from '@shared/utils/storage.util';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from './dolar-api.service';

const PAYLOAD = [
	{ casa: 'blue', nombre: 'Dólar libre', compra: 1400, venta: 1450, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
	{ casa: 'oficial', nombre: 'Oficial', compra: 1000, venta: 1050, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
];

const OTRAS_MONEDAS = [
	{ moneda: 'USD', casa: 'oficial', nombre: 'Dólar', compra: 1535, venta: 1585, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
	{ moneda: 'EUR', casa: 'oficial', nombre: 'Euro', compra: 1706, venta: 1720, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
	{ moneda: 'BRL', casa: 'oficial', nombre: 'Real Brasileño', compra: 280, venta: 285, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
];

/** Los dólares y las otras monedas salen de dos URLs distintas. */
function respondByUrl(porUrl: (url: string) => unknown): jasmine.Spy {
	return spyOn(window, 'fetch').and.callFake((input: RequestInfo | URL) => {
		const url = String(input);
		const body = porUrl(url);
		if (body === undefined) return Promise.reject(new Error(`sin respuesta para ${url}`));
		return Promise.resolve({ ok: true, status: 200, statusText: 'OK', json: async () => body } as Response);
	});
}

function respondWith(body: unknown, ok = true, status = 200): jasmine.Spy {
	return spyOn(window, 'fetch').and.resolveTo({
		ok,
		status,
		statusText: ok ? 'OK' : 'Server Error',
		json: async () => body,
	} as Response);
}

describe('DolarAPIService', () => {
	let service: DolarAPIService;

	beforeEach(() => {
		service = new DolarAPIService();
	});

	it('trae las cotizaciones y las guarda en storage', async () => {
		respondWith(PAYLOAD);

		const rates = await service.getAll();

		expect(rates.length).toBe(2);
		expect(rates[0].casa).toBe('blue');
		expect(rates[0].compra).toBe(1400);
		expect((await getLocalStorage<ExchangeRate[]>(LOCALSTORAGE_EXCHANGERATES))!.length).toBe(2);
	});

	it('usa el caché si tiene menos de 5 minutos', async () => {
		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, PAYLOAD);
		const fetchSpy = respondWith(PAYLOAD);

		await service.getAll();

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('ignora el caché vencido', async () => {
		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, PAYLOAD);
		await setLocalStorage(lastUpdatedKey(LOCALSTORAGE_EXCHANGERATES), Date.now() - 6 * 60 * 1000);
		const fetchSpy = respondWith(PAYLOAD);

		await service.getAll();

		expect(fetchSpy).toHaveBeenCalled();
	});

	it('con forceRefresh pide datos aunque el caché esté fresco', async () => {
		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, PAYLOAD);
		const fetchSpy = respondWith(PAYLOAD);

		await service.getAll(true);

		expect(fetchSpy).toHaveBeenCalled();
	});

	it('descarta las entradas con forma inesperada', async () => {
		respondWith([...PAYLOAD, { casa: 'roto' }, null, { casa: 'texto', compra: 'mil', venta: 'mil' }]);

		const rates = await service.getAll(true);

		expect(rates.map((rate) => rate.casa)).toEqual(['blue', 'oficial']);
	});

	it('cae al último valor guardado si la API falla', async () => {
		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, PAYLOAD);
		spyOn(window, 'fetch').and.rejectWith(new Error('sin red'));

		const rates = await service.getAll(true);

		expect(rates.length).toBe(2);
	});

	it('lanza un error legible si falla y no hay nada guardado', async () => {
		respondWith(null, false, 500);

		await expectAsync(service.getAll(true)).toBeRejectedWithError(/No se pudo obtener la cotización/);
	});

	it('lanza si la respuesta no es una lista y no hay caché', async () => {
		respondWith({ mensaje: 'no es una lista' });

		await expectAsync(service.getAll(true)).toBeRejectedWithError(/No se pudo obtener la cotización/);
	});

	describe('otras monedas', () => {
		const responder = () => respondByUrl((url) => (url.endsWith('/dolares') ? PAYLOAD : OTRAS_MONEDAS));

		it('no las pide si no se piden', async () => {
			const fetchSpy = respondWith(PAYLOAD);

			const rates = await service.getAll(true);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(rates.length).toBe(2);
		});

		// Vienen todas con casa "oficial": se las identifica por el código de
		// moneda, y el dólar se descarta porque ya está en la lista principal.
		it('las suma con su código de moneda y sin repetir el dólar', async () => {
			responder();

			const rates = await service.getAll(true, true);

			expect(rates.map((rate) => rate.casa)).toEqual(['blue', 'oficial', 'eur', 'brl']);
			expect(rates.find((rate) => rate.casa === 'eur')!.nombre).toBe('Euro');
			expect(rates.find((rate) => rate.casa === 'eur')!.venta).toBe(1720);
		});

		it('ignora el caché si lo guardado no coincide con la preferencia', async () => {
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, PAYLOAD);
			const fetchSpy = responder();

			await service.getAll(false, true);

			expect(fetchSpy).toHaveBeenCalled();
		});

		it('usa el caché si ya trae las otras monedas', async () => {
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, [...PAYLOAD, { casa: 'eur', nombre: 'Euro', compra: 1706, venta: 1720 }]);
			const fetchSpy = responder();

			const rates = await service.getAll(false, true);

			expect(fetchSpy).not.toHaveBeenCalled();
			expect(rates.length).toBe(3);
		});

		// Son un extra: si ese pedido falla, los dólares se muestran igual.
		it('devuelve los dólares aunque falle el pedido de las otras', async () => {
			respondByUrl((url) => (url.endsWith('/dolares') ? PAYLOAD : undefined));

			const rates = await service.getAll(true, true);

			expect(rates.map((rate) => rate.casa)).toEqual(['blue', 'oficial']);
		});
	});
});
