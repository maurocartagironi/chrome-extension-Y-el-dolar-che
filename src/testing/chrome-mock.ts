/**
 * Doble de las APIs de chrome.* que usa la extensión, para que los tests
 * puedan correr en un browser normal (en Karma `chrome` no existe).
 */
export interface ChromeMock {
	storage: { local: Record<string, any> };
	i18n: { messages: Record<string, string> };
	badge: { text?: string; color?: string; title?: string };
	alarms: { created: { name: string; info: any }[] };
}

export function installChromeMock(): ChromeMock {
	const store = new Map<string, any>();
	const messages: Record<string, string> = {};
	const badge: ChromeMock['badge'] = {};
	const created: { name: string; info: any }[] = [];

	const chromeStub = {
		runtime: { lastError: undefined as unknown },
		storage: {
			local: {
				get: (keys: string | string[], callback: (items: Record<string, any>) => void) => {
					const list = Array.isArray(keys) ? keys : [keys];
					const result: Record<string, any> = {};
					for (const key of list) {
						if (store.has(key)) result[key] = store.get(key);
					}
					callback(result);
				},
				set: async (items: Record<string, any>) => {
					for (const [key, value] of Object.entries(items)) store.set(key, value);
				},
				remove: async (keys: string | string[]) => {
					for (const key of Array.isArray(keys) ? keys : [keys]) store.delete(key);
				},
			},
		},
		i18n: {
			getMessage: (key: string, substitutions?: string | string[]) => {
				const template = messages[key] ?? '';
				const list = substitutions === undefined ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
				return list.reduce<string>((text, value, index) => text.split(`$${index + 1}`).join(value), template);
			},
		},
		action: {
			setBadgeText: async ({ text }: { text: string }) => void (badge.text = text),
			setBadgeBackgroundColor: async ({ color }: { color: string }) => void (badge.color = color),
			setTitle: async ({ title }: { title: string }) => void (badge.title = title),
		},
		alarms: {
			get: async () => undefined,
			create: async (name: string, info: any) => void created.push({ name, info }),
		},
	};

	(globalThis as any).chrome = chromeStub;

	return {
		storage: {
			get local() {
				return Object.fromEntries(store.entries());
			},
		},
		i18n: { messages },
		badge,
		alarms: { created },
	};
}

export function uninstallChromeMock(): void {
	(globalThis as any).chrome = undefined;
}
