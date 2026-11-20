import esMessages from '../_locales/es/messages.json';

/** Una entrada de `_locales/<idioma>/messages.json`. */
interface LocaleEntry {
	message: string;
	placeholders?: Record<string, { content: string }>;
}

const LOCALE = esMessages as Record<string, LocaleEntry>;

/**
 * Resuelve los `$var$` con nombre (como lo hace chrome.i18n) y despues los
 * `$1`, `$2`... posicionales.
 */
function render(entry: LocaleEntry, values: string[]): string {
	let text = entry.message;
	for (const [name, placeholder] of Object.entries(entry.placeholders ?? {})) {
		const index = Number(String(placeholder.content).slice(1)) - 1;
		text = text.split(`$${name}$`).join(values[index] ?? '');
	}
	return values.reduce((acc, value, index) => acc.split(`$${index + 1}`).join(value), text);
}

/**
 * Doble de las APIs de chrome.* que usa la extensión, para que los tests
 * puedan correr en un browser normal (en Karma `chrome` no existe).
 *
 * i18n arranca con los mensajes reales de `_locales/es`: así los tests ven los
 * mismos textos que el usuario y una clave que falte se nota.
 */
export interface ChromeMock {
	storage: { local: Record<string, any> };
	i18n: { messages: Record<string, string> };
	badge: { text?: string; color?: string; title?: string };
	alarms: { created: { name: string; info: any }[] };
	notifications: { sent: { id: string; options: any }[] };
	contextMenus: { items: { id: string; title: string }[] };
}

export function installChromeMock(): ChromeMock {
	const store = new Map<string, any>();
	const messages: Record<string, string> = {};
	const badge: ChromeMock['badge'] = {};
	const created: { name: string; info: any }[] = [];
	const sent: { id: string; options: any }[] = [];
	let menus: { id: string; title: string }[] = [];

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
				const list = substitutions === undefined ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
				// Lo que el test haya seteado a mano gana sobre el locale real.
				const override = messages[key];
				if (override !== undefined) return render({ message: override }, list);
				const entry = LOCALE[key];
				return entry ? render(entry, list) : '';
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
		notifications: {
			create: async (id: string, options: any) => {
				sent.push({ id, options });
				return id;
			},
		},
		contextMenus: {
			removeAll: async () => void (menus = []),
			create: (item: { id: string; title: string }) => void menus.push(item),
			onClicked: { addListener() {} },
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
		notifications: { sent },
		contextMenus: {
			get items() {
				return menus;
			},
		},
	};
}

export function uninstallChromeMock(): void {
	(globalThis as any).chrome = undefined;
}
