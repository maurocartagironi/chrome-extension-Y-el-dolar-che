/**
 * Postbuild: la extensión corre solo en Chromium, que siempre elige woff2.
 * PrimeIcons empaqueta además eot/ttf/woff/svg (~600 kB muertos en el .zip).
 * Este script los borra y deja el @font-face apuntando solo a woff2.
 */
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const CSS = join(DIST, 'styles.css');
const DROP = /^primeicons\.(eot|ttf|woff|svg)$/;

const FONT_FACE =
	/@font-face\{font-family:primeicons;([^}]*?)src:url\(primeicons\.eot\);src:[^;]*;/;

let removed = 0;

const css = await readFile(CSS, 'utf8');
if (FONT_FACE.test(css)) {
	await writeFile(
		CSS,
		css.replace(
			FONT_FACE,
			'@font-face{font-family:primeicons;$1src:url(primeicons.woff2) format("woff2");'
		),
		'utf8'
	);

	for (const file of await readdir(DIST)) {
		if (!DROP.test(file)) continue;
		const path = join(DIST, file);
		removed += (await stat(path)).size;
		await rm(path);
	}

	console.log(`prune-fonts: ${(removed / 1024).toFixed(0)} kB de fuentes no usadas eliminados.`);
} else {
	// No rompemos el build por una optimización: puede cambiar al actualizar PrimeIcons.
	console.warn('prune-fonts: no se encontró el @font-face de primeicons, no se tocó nada.');
}
