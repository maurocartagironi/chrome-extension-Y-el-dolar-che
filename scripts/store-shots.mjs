/**
 * Las capturas de 1280×800 de la ficha de la tienda, todas de una.
 *
 *   npm run shots:store
 *
 * Cada una es una corrida de preview.mjs --store con su texto. Los nombres
 * salen del propio preview (preview-store*.png) y están en .gitignore: se
 * regeneran cuando hace falta en vez de versionarse.
 */
import { spawn } from 'node:child_process';

const CAPTURAS = [
	{
		args: [],
		titulo: 'El dólar, siempre a mano',
		bajada: 'Todas las cotizaciones, la variación del día y un conversor, sin salir del navegador.',
	},
	{
		args: ['--tab=1'],
		titulo: 'Convertí sin calculadora',
		bajada: 'De pesos a dólares y al revés, con el tipo de cambio que elijas.',
	},
	{
		args: ['--tab=2', '--click=#toggleAlert'],
		titulo: 'Avisame cuando cruce',
		bajada: 'Una notificación cuando el precio supere, o baje de, el valor que marques.',
	},
	{
		args: ['--monedas'],
		titulo: 'No solo el dólar',
		bajada: 'Euro, real, peso chileno y peso uruguayo, en la misma tabla.',
	},
	{
		args: ['--dark'],
		titulo: 'También de noche',
		bajada: 'Sigue el modo del navegador, o elegís vos desde el encabezado.',
	},
];

for (const captura of CAPTURAS) {
	const args = ['scripts/preview.mjs', '--shot', '--store', `--titulo=${captura.titulo}`, `--bajada=${captura.bajada}`, ...captura.args];

	await new Promise((cumplir, fallar) => {
		const node = spawn(process.execPath, args, { stdio: 'inherit' });
		node.on('exit', (code) => (code === 0 ? cumplir() : fallar(new Error(`preview salió con ${code}`))));
	});
}
