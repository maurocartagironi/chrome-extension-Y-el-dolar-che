/**
 * Todas las imágenes de la ficha de la tienda, de una.
 *
 *   npm run assets:store
 *
 * Cada pieza es una corrida de preview.mjs con su lienzo y su texto. Caen en
 * docs/assets/ y se commitean, porque son las que se suben a la tienda y las
 * que muestra la página de GitHub Pages: si no están en el repo, la página
 * queda sin imágenes.
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const DESTINO = 'docs/assets';

const PIEZAS = [
	{
		salida: 'captura-1.png',
		args: ['--store'],
		titulo: 'El dólar, siempre a mano',
		bajada: 'Todas las cotizaciones, la variación del día y un conversor, sin salir del navegador.',
	},
	{
		salida: 'captura-2.png',
		args: ['--store', '--tab=1'],
		titulo: 'Convertí sin calculadora',
		bajada: 'De pesos a dólares y al revés, con el tipo de cambio que elijas.',
	},
	{
		salida: 'captura-3.png',
		args: ['--store', '--tab=2', '--click=#toggleAlert'],
		titulo: 'Avisame cuando cruce',
		bajada: 'Una notificación cuando el precio supere, o baje de, el valor que marques.',
	},
	{
		salida: 'captura-4.png',
		args: ['--store', '--monedas'],
		titulo: 'No solo el dólar',
		bajada: 'Euro, real, peso chileno y peso uruguayo, en la misma tabla.',
	},
	{
		salida: 'captura-5.png',
		args: ['--store', '--dark'],
		titulo: 'También de noche',
		bajada: 'Sigue el modo del navegador, o elegís vos desde el encabezado.',
	},
	// Para la página van capturas limpias del popup: las de la tienda traen
	// el título de marketing quemado y ahí duplicaría el texto de la página.
	{ salida: 'popup-cotizaciones.png', args: ['--ventana=460,650'] },
	{ salida: 'popup-conversor.png', args: ['--tab=1', '--ventana=460,650'] },
	{ salida: 'popup-oscuro.png', args: ['--dark', '--ventana=460,650'] },
	{ salida: 'ficha-440x280.png', args: ['--tile'] },
	{ salida: 'marquesina-1400x560.png', args: ['--marquee'] },
];

await mkdir(DESTINO, { recursive: true });

for (const pieza of PIEZAS) {
	const args = ['scripts/preview.mjs', '--shot', `--out=${DESTINO}/${pieza.salida}`, ...pieza.args];
	if (pieza.titulo) args.push(`--titulo=${pieza.titulo}`, `--bajada=${pieza.bajada}`);

	await new Promise((cumplir, fallar) => {
		const node = spawn(process.execPath, args, { stdio: 'inherit' });
		node.on('exit', (code) => (code === 0 ? cumplir() : fallar(new Error(`preview salió con ${code}`))));
	});
}
