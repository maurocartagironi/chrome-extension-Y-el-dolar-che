/**
 * Postbuild: saca del paquete lo que no se usa.
 *
 * 1. La extensión corre solo en Chromium, que siempre elige woff2. PrimeIcons
 *    empaqueta además eot/ttf/woff/svg (~600 kB muertos en el .zip).
 * 2. El builder emite prerendered-routes.json, que no tiene sentido acá.
 * 3. `ng test` deja un dist/test-out que no va en el paquete.
 */
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const CSS = join(DIST, 'styles.css');
const FONT_DIR = join(DIST, 'media');
const DROP = /^primeicons\.(eot|ttf|woff|svg)$/;

// El builder reescribe las url() a ./media/, así que el patrón acepta cualquier
// prefijo de ruta y las comillas opcionales que mete el minificador.
const FONT_FACE = /@font-face\{font-family:primeicons;([^}]*?)src:url\(\s*"?[^")]*primeicons\.eot"?\s*\);src:[^;]*;/;

// Archivos que generan el builder o el runner de tests y que no van al .zip.
await rm(join(DIST, 'prerendered-routes.json'), { force: true });
await rm(join(DIST, 'test-out'), { force: true, recursive: true });

const css = await readFile(CSS, 'utf8');

if (!FONT_FACE.test(css)) {
	// No rompemos el build por una optimización: puede cambiar al actualizar
	// PrimeIcons o el builder.
	console.warn('prune-package: no se encontró el @font-face de primeicons, no se tocó nada.');
	process.exit(0);
}

const woff2 = css.match(/url\(\s*"?([^")]*primeicons\.woff2)"?\s*\)/);
if (!woff2) {
	console.warn('prune-package: no se encontró el woff2 de primeicons, no se tocó nada.');
	process.exit(0);
}

await writeFile(CSS, css.replace(FONT_FACE, `@font-face{font-family:primeicons;$1src:url("${woff2[1]}") format("woff2");`), 'utf8');

let removed = 0;
for (const dir of [FONT_DIR, DIST]) {
	const files = await readdir(dir).catch(() => []);
	for (const file of files) {
		if (!DROP.test(file)) continue;
		const path = join(dir, file);
		removed += (await stat(path)).size;
		await rm(path);
	}
}

console.log(`prune-package: ${(removed / 1024).toFixed(0)} kB de fuentes no usadas eliminados.`);
