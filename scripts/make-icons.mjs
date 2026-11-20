/**
 * Genera los PNG del icono a partir de `src/assets/img/icon.svg`.
 *
 * El icono venía solo en 48×48 y la tienda pide uno de 128, que escalado
 * desde ahí sale borroso. Con el vector cada tamaño se dibuja nítido.
 *
 *   node scripts/make-icons.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SVG = 'src/assets/img/icon.svg';
const SALIDA = 'src/assets/img';
const TAMANIOS = [16, 32, 48, 128];

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

const chromeBin = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chromeBin) {
	console.error('make-icons: no encontré Chrome. Pasá la ruta en CHROME_BIN.');
	process.exit(1);
}

const svg = await readFile(SVG, 'utf8');
const trabajo = await mkdtemp(join(tmpdir(), 'iconos-'));

for (const tamanio of TAMANIOS) {
	// El SVG va embebido en una página del tamaño exacto: el screenshot de
	// Chrome captura la ventana, así que la ventana es el tamaño del icono.
	const html = `<!doctype html><meta charset="utf-8"><style>
		html,body{margin:0;padding:0;background:transparent}
		svg{display:block;width:${tamanio}px;height:${tamanio}px}
	</style>${svg.replace(/width="\d+" height="\d+"/, '')}`;

	const pagina = join(trabajo, `icon-${tamanio}.html`);
	await writeFile(pagina, html, 'utf8');

	const destino = resolve(SALIDA, `icon-${tamanio}.png`);
	await new Promise((cumplir, fallar) => {
		const chrome = spawn(chromeBin, [
			'--headless=new',
			'--disable-gpu',
			'--hide-scrollbars',
			// Sin esto el fondo sale blanco y el icono deja de ser redondo.
			'--default-background-color=00000000',
			'--force-device-scale-factor=1',
			`--window-size=${tamanio},${tamanio}`,
			`--screenshot=${destino}`,
			`file://${pagina.split('\\').join('/')}`,
		]);
		chrome.on('exit', (code) => (code === 0 ? cumplir() : fallar(new Error(`chrome salió con ${code}`))));
	});

	console.log(`make-icons: ${destino}`);
}
