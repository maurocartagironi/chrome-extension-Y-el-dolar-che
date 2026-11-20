import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config, ConfigOptions } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { setLocalStorage } from '@shared/utils/storage.util';
import { ChromeMock, installChromeMock } from 'src/testing/chrome-mock';
import { BackgroundHelper, MENU_FROM_ARS, MENU_TO_ARS } from './background.helper';

const RATES = [
	new ExchangeRate('blue', 'Dólar libre', 1400.6, 1450.2, '2026-11-19T12:00:00.000Z'),
	new ExchangeRate('oficial', 'Oficial', 1000, 1050, '2026-11-19T12:00:00.000Z'),
];

describe('BackgroundHelper', () => {
	let helper: BackgroundHelper;
	let mock: ChromeMock;

	beforeEach(() => {
		mock = installChromeMock();
		mock.i18n.messages['tooltip'] = '$1 compra $2 vende $3 hace $4';
		mock.i18n.messages['n_secs'] = ' segundo(s)';
		mock.i18n.messages['n_days'] = ' día(s)';
		helper = new BackgroundHelper();
	});

	// Este era el bug: settings llamaba sin lista y el badge nunca se actualizaba.
	it('pinta el badge con la lista que le pasan', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ badgeExchangeRateType: 'blue' }));

		await helper.setBadgeAndTooltip(RATES);

		expect(mock.badge.text).toBe('1401');
		expect(mock.badge.title).toContain('Dólar libre');
	});

	it('usa el valor de venta si así está configurado', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ badgeExchangeRateType: 'blue', badgeExchangeRateAction: 'sell' }));

		await helper.setBadgeAndTooltip(RATES);

		expect(mock.badge.text).toBe('1450');
	});

	it('cae a la primera cotización si la elegida no está en la lista', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ badgeExchangeRateType: 'no-existe' }));

		await helper.setBadgeAndTooltip(RATES);

		expect(mock.badge.text).toBe('1401');
	});

	it('no explota si no hay cotizaciones', async () => {
		await expectAsync(helper.setBadgeAndTooltip([])).toBeResolved();
		expect(mock.badge.text).toBeUndefined();
	});

	it('guarda una config por defecto si no había ninguna', async () => {
		await helper.setBadgeAndTooltip(RATES);

		expect(mock.storage.sync['config']).toBeDefined();
	});

	it('refreshData fuerza el fetch en lugar de confiar en el caché', async () => {
		const getAll = spyOn(helper.dolarApiService, 'getAll').and.resolveTo(RATES);

		await helper.refreshData();

		expect(getAll).toHaveBeenCalledWith(true, false);
		expect(mock.badge.text).toBeDefined();
	});

	it('muestra el error en el tooltip sin tocar la config', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ darkMode: 'dark' }));

		await helper.showError(new Error('se cayó la API'));

		expect(mock.badge.text).toBe('!');
		expect(mock.badge.title).toBe('se cayó la API');
		expect(mock.storage.sync['config']).toBeDefined();
	});

	describe('aviso por valor', () => {
		/** Deja el helper con la lista cargada y la config pedida. */
		const prepare = async (opts: Partial<ConfigOptions>) => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ alertEnabled: true, alertExchangeRateType: 'blue', ...opts }));
			spyOn(helper.dolarApiService, 'getAll').and.resolveTo(RATES);
			await helper.refreshData();
		};

		it('no avisa si el aviso está apagado', async () => {
			await prepare({ alertEnabled: false, alertValue: 1 });

			expect(mock.notifications.sent.length).toBe(0);
		});

		it('no avisa sin un valor cargado', async () => {
			await prepare({ alertValue: 0 });

			expect(mock.notifications.sent.length).toBe(0);
		});

		// El blue vende a 1450: supera los 1400 que se marcaron.
		it('avisa cuando el precio de venta supera el valor', async () => {
			await prepare({ alertDirection: 'above', alertValue: 1400 });

			expect(mock.notifications.sent.length).toBe(1);
			expect(mock.notifications.sent[0].options.message).toContain('Dólar libre');
		});

		it('no avisa si todavía no lo superó', async () => {
			await prepare({ alertDirection: 'above', alertValue: 1500 });

			expect(mock.notifications.sent.length).toBe(0);
		});

		it('avisa cuando baja del valor', async () => {
			await prepare({ alertDirection: 'below', alertValue: 1500 });

			expect(mock.notifications.sent.length).toBe(1);
		});

		// Si no, mandaría una notificación cada diez minutos hasta que el precio
		// se diera vuelta.
		it('avisa una sola vez mientras la condición se siga cumpliendo', async () => {
			await prepare({ alertDirection: 'above', alertValue: 1400 });

			await helper.checkAlert();
			await helper.checkAlert();

			expect(mock.notifications.sent.length).toBe(1);
		});

		it('vuelve a avisar después de que la condición deje de cumplirse', async () => {
			await prepare({ alertDirection: 'above', alertValue: 1400 });

			helper.exchangeRateList = [new ExchangeRate('blue', 'Dólar libre', 1300, 1350, '2026-11-19T12:00:00.000Z')];
			await helper.checkAlert();
			helper.exchangeRateList = RATES;
			await helper.checkAlert();

			expect(mock.notifications.sent.length).toBe(2);
		});

		it('no avisa si el tipo de cambio elegido no está en la lista', async () => {
			await prepare({ alertExchangeRateType: 'inexistente', alertDirection: 'above', alertValue: 1 });

			expect(mock.notifications.sent.length).toBe(0);
		});
	});

	describe('conversión desde el menú del click derecho', () => {
		beforeEach(async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ badgeExchangeRateType: 'blue' }));
			helper.exchangeRateList = RATES;
		});

		it('arma los dos ítems del menú', async () => {
			await helper.setupContextMenus();

			expect(mock.contextMenus.items.map((item) => item.id)).toEqual([MENU_TO_ARS, MENU_FROM_ARS]);
		});

		// 250 dólares al blue: 250 × 1400,6 de compra y 250 × 1450,2 de venta.
		it('convierte la selección a pesos', async () => {
			await helper.convertSelection(MENU_TO_ARS, 'USD 250');

			const mensaje = mock.notifications.sent[0].options.message.replace(/\u00a0/g, ' ');
			expect(mock.notifications.sent[0].options.title).toBe('Dólar libre');
			expect(mensaje).toContain('350.150,00');
			expect(mensaje).toContain('362.550,00');
		});

		it('convierte la selección desde pesos', async () => {
			await helper.convertSelection(MENU_FROM_ARS, '$ 1.450,20');

			const mensaje = mock.notifications.sent[0].options.message.replace(/\u00a0/g, ' ');
			expect(mensaje).toContain('1,00');
		});

		it('avisa cuando la selección no tiene un número', async () => {
			await helper.convertSelection(MENU_TO_ARS, 'dos mil');

			expect(mock.notifications.sent.length).toBe(1);
			expect(mock.notifications.sent[0].options.message).toContain('dos mil');
		});

		it('ignora cualquier otro ítem de menú', async () => {
			await helper.convertSelection('otra-cosa', '250');

			expect(mock.notifications.sent.length).toBe(0);
		});

		// El service worker se despierta sin estado: si no tiene la lista en
		// memoria, la pide.
		it('pide las cotizaciones si no las tiene en memoria', async () => {
			helper.exchangeRateList = [];
			const getAll = spyOn(helper.dolarApiService, 'getAll').and.resolveTo(RATES);

			await helper.convertSelection(MENU_TO_ARS, '250');

			expect(getAll).toHaveBeenCalled();
			expect(mock.notifications.sent.length).toBe(1);
		});
	});
});
