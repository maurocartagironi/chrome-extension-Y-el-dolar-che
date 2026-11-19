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
});
