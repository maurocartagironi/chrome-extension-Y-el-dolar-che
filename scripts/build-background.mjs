/**
 * Build del service worker, aparte del de Angular.
 *
 * El background no usa Angular (a propósito: ver el README), así que no tiene
 * por qué pasar por el builder de Angular. Compilándolo con esbuild directo
 * se evita el builder de webpack custom y el truco de importScripts que hacía
 * falta para unir background.js con el runtime de webpack.
 */
import { build } from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
	entryPoints: ['src/background.ts'],
	outfile: 'dist/background.js',
	bundle: true,
	format: 'iife',
	platform: 'browser',
	target: 'chrome116',
	minify: !watch,
	sourcemap: watch ? 'inline' : false,
	legalComments: 'none',
	logLevel: 'info',
	tsconfig: 'tsconfig.background.json',
	// esbuild no conoce el fileReplacements de angular.json: sin esto el
	// service worker se compilaría contra el environment de desarrollo.
	alias: watch ? undefined : { 'src/environments/environment': 'src/environments/environment.prod.ts' },
};

if (watch) {
	const context = await (await import('esbuild')).context(options);
	await context.watch();
} else {
	await build(options);
}
