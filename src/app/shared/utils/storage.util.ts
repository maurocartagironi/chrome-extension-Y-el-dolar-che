import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';

/**
 * Marca de tiempo de la última escritura de cada clave.
 * Se guarda por clave (`<clave>:lastUpdated`) para que escribir una cosa
 * no haga parecer fresco el caché de otra.
 */
export const lastUpdatedKey = (param: string): string => `${param}:lastUpdated`;

const SUFFIX = ':lastUpdated';

/**
 * La configuración viaja en `chrome.storage.sync`, así que las preferencias
 * siguen al usuario entre sus máquinas. Las cotizaciones y el histórico no:
 * son caché, pesan, y sync tiene cuota de 8 kB por item y límite de
 * escrituras por minuto.
 */
const SYNCED_KEYS: string[] = [LOCALSTORAGE_CONFIG];

function isSynced(param: string): boolean {
	const base = param.endsWith(SUFFIX) ? param.slice(0, -SUFFIX.length) : param;
	return SYNCED_KEYS.includes(base) && Boolean(chrome.storage.sync);
}

function areaFor(param: string): chrome.storage.StorageArea {
	return isSynced(param) ? chrome.storage.sync : chrome.storage.local;
}

function readFrom<T>(area: chrome.storage.StorageArea, param: string): Promise<T | undefined> {
	return new Promise<T | undefined>((resolve, reject) => {
		try {
			area.get(param, (result: Record<string, T>) => {
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

export async function getLocalStorage<T = unknown>(param: string): Promise<T | undefined> {
	if (!isSynced(param)) {
		return readFrom<T>(chrome.storage.local, param);
	}

	const synced = await readFrom<T>(chrome.storage.sync, param);
	if (synced !== undefined) return synced;

	// Quien ya tenía la extensión instalada guardó la config en local: se la
	// sube a sync la primera vez y de ahí en más viaja con la cuenta.
	const local = await readFrom<T>(chrome.storage.local, param);
	if (local !== undefined) {
		await chrome.storage.sync.set({ [param]: local }).catch(() => undefined);
	}
	return local;
}

export async function setLocalStorage(param: string, value: unknown): Promise<void> {
	const items = {
		[param]: value,
		[lastUpdatedKey(param)]: Date.now(),
	};

	try {
		await areaFor(param).set(items);
	} catch {
		// sync puede rechazar por cuota o por estar deshabilitado: no es razón
		// para perder la preferencia.
		await chrome.storage.local.set(items);
	}
}

export async function getLastUpdated(param: string): Promise<number | null> {
	const value = await getLocalStorage(lastUpdatedKey(param));
	const timestamp = Number(value);
	return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export async function removeLocalStorage(param: string): Promise<void> {
	const keys = [param, lastUpdatedKey(param)];
	await areaFor(param).remove(keys);
	if (isSynced(param)) {
		await chrome.storage.local.remove(keys);
	}
}
