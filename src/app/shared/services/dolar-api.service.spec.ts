import { LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { getLocalStorage, lastUpdatedKey, setLocalStorage } from '@shared/utils/storage.util';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from './dolar-api.service';

const PAYLOAD = [
	{ casa: 'blue', nombre: 'Dólar libre', compra: 1400, venta: 1450, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
	{ casa: 'oficial', nombre: 'Oficial', compra: 1000, venta: 1050, fechaActualizacion: '2026-11-19T12:00:00.000Z' },
];

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
});
