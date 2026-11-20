/**
 * Preview del popup fuera de la extensión.
 *
 * Levanta `dist/` en un servidor local con las APIs de chrome.* stubbeadas y
 * datos de ejemplo, para poder abrir el popup en un browser normal o sacarle
 * una captura sin tener que empaquetar e instalar la extensión.
 *
 *   node scripts/preview.mjs               # sirve en http://localhost:4210
 *   node scripts/preview.mjs --shot        # además guarda preview.png
 *   node scripts/preview.mjs --shot --dark # la captura en modo oscuro
 *   node scripts/preview.mjs --shot --monedas # con las otras monedas activadas
 *   node scripts/preview.mjs --shot --error   # la tarjeta de error
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const PORT = 4210;
const VIRTUAL_TIME_MS = 6000;
/** El click va cerca del final del presupuesto de tiempo virtual, para que
 * la captura agarre los estados efímeros (como el toast de copiado). */
const CLICK_AT_MS = VIRTUAL_TIME_MS - 800;
const DIST = 'dist';
/** Se puede forzar con CHROME_BIN; si no, se prueban las rutas habituales. */
const CHROME_CANDIDATES = [
	process.env['CHROME_BIN'],
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	process.env['LOCALAPPDATA'] && `${process.env['LOCALAPPDATA']}/Google/Chrome/Application/chrome.exe`,
	'/usr/bin/google-chrome',
	'/usr/bin/chromium',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const dark = process.argv.includes('--dark');
/** Simula la configuración con el conversor oculto. */
const hidden = process.argv.includes('--hidden');
/** Simula la configuración con las otras monedas activadas. */
const monedas = process.argv.includes('--monedas');
/** Simula la API caída y sin nada cacheado, para ver la tarjeta de error. */
const error = process.argv.includes('--error');
const tab = Number((process.argv.find((a) => a.startsWith('--tab=')) ?? '--tab=0').split('=')[1]);
/** Selector a enfocar antes de la captura, para ver tooltips y foco. */
const focus = (process.argv.find((a) => a.startsWith('--focus=')) ?? '--focus=').split('=').slice(1).join('=');
/** Selector a clickear antes de la captura, para ver estados interactivos. */
const click = (process.argv.find((a) => a.startsWith('--click=')) ?? '--click=').split('=').slice(1).join('=');
const shot = process.argv.includes('--shot');

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.woff2': 'font/woff2',
	'.svg': 'image/svg+xml',
};

const messages = JSON.parse(await readFile(join(DIST, '_locales/es/messages.json'), 'utf8'));

/** Euro, real, peso chileno y peso uruguayo, como los devuelve /cotizaciones. */
const OTHER = [
	{ moneda: 'USD', nombre: 'Dólar', compra: 1535, venta: 1585 },
	{ moneda: 'EUR', nombre: 'Euro', compra: 1706.47, venta: 1720.25 },
	{ moneda: 'BRL', nombre: 'Real Brasileño', compra: 283.4, venta: 287.1 },
	{ moneda: 'CLP', nombre: 'Peso Chileno', compra: 1.58, venta: 1.62 },
	{ moneda: 'UYU', nombre: 'Peso Uruguayo', compra: 38.9, venta: 39.4 },
];

/** Cotizaciones de ejemplo, con tendencias mezcladas para ver los tres chips. */
const DOLARES = [
	{ casa: 'oficial', nombre: 'Oficial', compra: 1535, venta: 1585 },
	{ casa: 'blue', nombre: 'Dólar libre', compra: 1620, venta: 1640 },
	{ casa: 'bolsa', nombre: 'Bolsa', compra: 1631.9, venta: 1649.8 },
	{ casa: 'contadoconliqui', nombre: 'Contado con liquidación', compra: 1739.8, venta: 1748.2 },
	{ casa: 'mayorista', nombre: 'Mayorista', compra: 1556, venta: 1565 },
	{ casa: 'cripto', nombre: 'Cripto', compra: 1733.21, venta: 1739.06 },
	{ casa: 'tarjeta', nombre: 'Tarjeta', compra: 1995.5, venta: 2060.5 },
];

/** Lo que termina en la tabla, según se hayan pedido las otras monedas. */
const RATES = monedas
	? [...DOLARES, ...OTHER.filter((m) => m.moneda !== 'USD').map((m) => ({ casa: m.moneda.toLowerCase(), ...m }))]
	: DOLARES;

/**
 * Treinta cierres diarios por casa, con una forma determinista para que la
 * captura sea siempre igual. El último es el valor de hoy y el anteúltimo, el
 * cierre contra el que se calcula la variación.
 */
const POINTS = 30;
const fechaHace = (dias) => {
	const fecha = new Date();
	fecha.setDate(fecha.getDate() - dias);
	return fecha.toLocaleDateString('en-CA');
};
const HISTORY = Object.fromEntries(
	RATES.map((rate, indice) => [
		rate.casa,
		Array.from({ length: POINTS }, (_, i) => {
			const dias = POINTS - 1 - i;
			// Una onda suave más una pendiente, distinta para cada casa.
			const factor = 1 - dias * 0.0025 + Math.sin((i + indice * 3) / 3.2) * 0.012;
			return {
				fecha: fechaHace(dias),
				compra: Number((rate.compra * factor).toFixed(2)),
				venta: Number((rate.venta * factor).toFixed(2)),
			};
		}).map((close, i, todos) =>
			i === todos.length - 1 ? { ...close, compra: RATES[indice].compra, venta: RATES[indice].venta } : close,
		),
	]),
);

const TREND = ['arrow-trend-up', 'arrow-trend-down', '', 'arrow-trend-up', '', 'arrow-trend-down', 'arrow-trend-up'];
const hace3horas = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

const stub = `
const SIN_RED = ${JSON.stringify(error)};
window.chrome = {
	runtime: { lastError: undefined, onInstalled: { addListener() {} }, onStartup: { addListener() {} } },
	storage: { local: (() => {
		const store = new Map(Object.entries({
			config: ${JSON.stringify({
				darkMode: dark ? 'dark' : 'light',
				defaultTab: tab,
				hiddenConversionSection: hidden,
				showOtherCurrencies: monedas,
				valueConversor: 1000,
				currencyConversor: 'blue-ars',
			})},
			...(${JSON.stringify(error)} ? {} : { exchangerates: ${JSON.stringify(
				RATES.map((r, i) => ({
					...r,
					fechaActualizacion: hace3horas,
					updatedCompra: TREND[i],
					updatedVenta: TREND[(i + 1) % TREND.length],
				})),
			)} }),
			...(${JSON.stringify(error)} ? {} : { 'exchangerates:lastUpdated': Date.now() }),
		}));
		return {
			get: (key, cb) => cb(store.has(key) ? { [key]: store.get(key) } : {}),
			set: async (items) => Object.entries(items).forEach(([k, v]) => store.set(k, v)),
			remove: async () => {},
		};
	})() },
	i18n: { getMessage: (key, subs) => {
		const entry = ${JSON.stringify(messages)}[key];
		if (!entry) return '';
		const list = subs === undefined ? [] : Array.isArray(subs) ? subs : [subs];
		let text = entry.message;
		for (const [name, def] of Object.entries(entry.placeholders ?? {})) {
			const index = Number(String(def.content).replace('$', '')) - 1;
			text = text.split('$' + name + '$').join(list[index] ?? '');
		}
		return list.reduce((acc, value, i) => acc.split('$' + (i + 1)).join(value), text);
	} },
	action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {}, setTitle: async () => {} },
	alarms: { get: async () => undefined, create: async () => {} },
};
// Permite capturar estados que requieren foco (tooltips, focus-visible).
if (${JSON.stringify(Boolean(focus))}) {
	setTimeout(() => {
		const target = document.querySelector(${JSON.stringify(focus)});
		if (target) target.focus();
		else console.warn('preview: no encontré', ${JSON.stringify(focus)});
	}, ${CLICK_AT_MS});
}

// Permite capturar estados que requieren interacción (clicks).
if (${JSON.stringify(Boolean(click))}) {
	setTimeout(() => {
		const target = document.querySelector(${JSON.stringify(click)});
		if (target) target.click();
		else console.warn('preview: no encontré', ${JSON.stringify(click)});
	}, ${CLICK_AT_MS});
}
const HISTORY = ${JSON.stringify(HISTORY)};
window.fetch = async (url) => {
	const direccion = String(url);
	if (SIN_RED) throw new Error('Failed to fetch');
	const cuerpo = direccion.includes('argentinadatos')
		? HISTORY[direccion.split('/').pop()] ?? []
		: direccion.endsWith('/v1/cotizaciones')
			? ${JSON.stringify(OTHER.map((m) => ({ ...m, casa: 'oficial', fechaActualizacion: hace3horas })))}
			: ${JSON.stringify(DOLARES.map((r) => ({ ...r, fechaActualizacion: hace3horas })))};
	return { ok: true, status: 200, statusText: 'OK', json: async () => cuerpo };
};
`;

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	let path = url.pathname === '/' ? '/index.html' : url.pathname;

	// El stub va como archivo aparte: inline, el HTML de los textos legales
	// rompe el parseo del <script>.
	if (path === '/preview-stub.js') {
		res.writeHead(200, { 'Content-Type': TYPES['.js'] });
		res.end(stub);
		return;
	}

	if (path === '/index.html') {
		const html = await readFile(join(DIST, 'index.html'), 'utf8');
		res.writeHead(200, { 'Content-Type': TYPES['.html'] });
		res.end(html.replace('<head>', '<head><script src="/preview-stub.js"></script>'));
		return;
	}

	try {
		const body = await readFile(join(DIST, path));
		res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404);
		res.end('no encontrado');
	}
});

server.listen(PORT, async () => {
	const target = `http://localhost:${PORT}/?target=popup`;
	console.log(`preview: ${target}`);

	if (!shot) return;

	// Chrome headless necesita la ruta absoluta para la captura.
	const chromeBin = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
	if (!chromeBin) {
		console.error('preview: no encontré Chrome. Pasá la ruta en CHROME_BIN.');
		server.close();
		return;
	}

	const out = resolve(
		`preview${error ? '-error' : ''}${tab ? '-tab' + tab : ''}${hidden ? '-sin-conversor' : ''}${monedas ? '-monedas' : ''}${click ? '-click' : ''}${focus ? '-focus' : ''}${dark ? '-dark' : ''}.png`,
	);
	await rm(out, { force: true });
	const chrome = spawn(chromeBin, [
		'--headless=new',
		'--disable-gpu',
		'--hide-scrollbars',
		'--force-device-scale-factor=2',
		'--window-size=460,760',
		`--virtual-time-budget=${VIRTUAL_TIME_MS}`,
		`--screenshot=${out}`,
		target,
	]);
	chrome.on('exit', (code) => {
		console.log(`captura: ${out} (chrome salió con ${code})`);
		server.close();
	});
});
