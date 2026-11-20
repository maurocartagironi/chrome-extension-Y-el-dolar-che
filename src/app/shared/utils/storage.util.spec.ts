import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { ChromeMock, installChromeMock } from 'src/testing/chrome-mock';
import { getLastUpdated, getLocalStorage, lastUpdatedKey, removeLocalStorage, setLocalStorage } from './storage.util';

describe('storage.util', () => {
	it('guarda y lee un valor', async () => {
		await setLocalStorage('config', { darkMode: 'dark' });
		expect(await getLocalStorage('config')).toEqual({ darkMode: 'dark' });
	});

	it('devuelve undefined para una clave que no existe', async () => {
		expect(await getLocalStorage('no-existe')).toBeUndefined();
	});

	it('marca la fecha de actualización por clave', async () => {
		await setLocalStorage('exchangerates', [{ casa: 'blue' }]);
		const rates = await getLastUpdated('exchangerates');
		expect(rates).not.toBeNull();
		expect(await getLastUpdated('config')).toBeNull();
	});

	// Este era el bug: una única clave global `lastUpdated` hacía que guardar
	// la config rejuveneciera el caché de cotizaciones.
	it('escribir otra clave no toca la fecha de las cotizaciones', async () => {
		await setLocalStorage('exchangerates', [{ casa: 'blue' }]);
		const before = await getLastUpdated('exchangerates');

		await setLocalStorage('config', { darkMode: 'dark' });

		expect(await getLastUpdated('exchangerates')).toBe(before);
		// Y que no quede la clave global que causaba el problema.
		expect(await getLocalStorage('lastUpdated')).toBeUndefined();
	});

	it('borra el valor junto con su fecha', async () => {
		await setLocalStorage('config', { darkMode: 'dark' });
		await removeLocalStorage('config');

		expect(await getLocalStorage('config')).toBeUndefined();
		expect(await getLocalStorage(lastUpdatedKey('config'))).toBeUndefined();
	});

	// La configuración viaja en sync para que las preferencias sigan al usuario
	// entre sus máquinas; las cotizaciones son caché y se quedan en local.
	describe('la configuración viaja en sync', () => {
		let mock: ChromeMock;

		beforeEach(() => {
			mock = installChromeMock();
		});

		it('guarda la config en sync y las cotizaciones en local', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, { darkMode: 'dark' });
			await setLocalStorage('exchangerates', [{ casa: 'blue' }]);

			expect(mock.storage.sync[LOCALSTORAGE_CONFIG]).toEqual({ darkMode: 'dark' });
			expect(mock.storage.local[LOCALSTORAGE_CONFIG]).toBeUndefined();
			expect(mock.storage.local['exchangerates']).toBeDefined();
			expect(mock.storage.sync['exchangerates']).toBeUndefined();
		});

		// Quien ya tenía la extensión instalada guardó la config en local.
		it('sube a sync la config que estaba en local', async () => {
			await chrome.storage.local.set({ [LOCALSTORAGE_CONFIG]: { darkMode: 'light' } });

			expect(await getLocalStorage(LOCALSTORAGE_CONFIG)).toEqual({ darkMode: 'light' });
			expect(mock.storage.sync[LOCALSTORAGE_CONFIG]).toEqual({ darkMode: 'light' });
		});

		it('borra la config de las dos áreas', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, { darkMode: 'dark' });
			await chrome.storage.local.set({ [LOCALSTORAGE_CONFIG]: { darkMode: 'dark' } });

			await removeLocalStorage(LOCALSTORAGE_CONFIG);

			expect(mock.storage.sync[LOCALSTORAGE_CONFIG]).toBeUndefined();
			expect(mock.storage.local[LOCALSTORAGE_CONFIG]).toBeUndefined();
		});
	});
});
