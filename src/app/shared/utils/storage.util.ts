/**
 * Marca de tiempo de la última escritura de cada clave.
 * Se guarda por clave (`<clave>:lastUpdated`) para que escribir una cosa
 * no haga parecer fresco el caché de otra.
 */
export const lastUpdatedKey = (param: string): string => `${param}:lastUpdated`;

export function getLocalStorage(param: string): Promise<any> {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.local.get(param, (result) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(result[param]);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
}

export async function setLocalStorage(param: string, value: any): Promise<void> {
	await chrome.storage.local.set({
		[param]: value,
		[lastUpdatedKey(param)]: Date.now(),
	});
}

export async function getLastUpdated(param: string): Promise<number | null> {
	const value = await getLocalStorage(lastUpdatedKey(param));
	const timestamp = Number(value);
	return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export async function removeLocalStorage(param: string): Promise<void> {
	await chrome.storage.local.remove([param, lastUpdatedKey(param)]);
}
