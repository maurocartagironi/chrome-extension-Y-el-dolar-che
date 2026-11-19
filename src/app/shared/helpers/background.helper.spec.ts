import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { setLocalStorage } from '@shared/utils/storage.util';
import { ChromeMock, installChromeMock } from 'src/testing/chrome-mock';
import { BackgroundHelper } from './background.helper';

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

		expect(mock.storage.local['config']).toBeDefined();
	});

	it('refreshData fuerza el fetch en lugar de confiar en el caché', async () => {
		const getAll = spyOn(helper.dolarApiService, 'getAll').and.resolveTo(RATES);

		await helper.refreshData();

		expect(getAll).toHaveBeenCalledWith(true);
		expect(mock.badge.text).toBeDefined();
	});

	it('muestra el error en el tooltip sin tocar la config', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ darkMode: 'dark' }));

		await helper.showError(new Error('se cayó la API'));

		expect(mock.badge.text).toBe('!');
		expect(mock.badge.title).toBe('se cayó la API');
		expect(mock.storage.local['config']).toBeDefined();
	});
});
