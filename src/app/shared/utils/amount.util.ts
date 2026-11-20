/**
 * Saca un número de un texto cualquiera: lo que el usuario haya seleccionado
 * en una página ("USD 1.250,50", "$ 1,250.50", "vale 300 dólares").
 *
 * El punto y la coma significan cosas distintas según quién escribió la
 * página, así que se decide cuál es el separador decimal por la posición y
 * por cuántos dígitos lo siguen.
 */
export function parseAmount(text: string): number | null {
	const limpio = (text ?? '').replace(/[^\d.,]/g, '');
	if (!limpio || !/\d/.test(limpio)) return null;

	const ultimoPunto = limpio.lastIndexOf('.');
	const ultimaComa = limpio.lastIndexOf(',');

	let normalizado: string;

	if (ultimoPunto >= 0 && ultimaComa >= 0) {
		// Están los dos: el que va último es el decimal y el otro agrupa miles.
		const decimal = ultimoPunto > ultimaComa ? '.' : ',';
		const miles = decimal === '.' ? ',' : '.';
		normalizado = limpio.split(miles).join('').replace(decimal, '.');
	} else if (ultimoPunto >= 0 || ultimaComa >= 0) {
		const separador = ultimoPunto >= 0 ? '.' : ',';
		const partes = limpio.split(separador);
		const decimales = partes[partes.length - 1].length;
		// "1.500" son mil quinientos; "1.50", uno con cincuenta.
		const esDecimal = partes.length === 2 && decimales > 0 && decimales < 3;
		normalizado = esDecimal ? `${partes[0]}.${partes[1]}` : partes.join('');
	} else {
		normalizado = limpio;
	}

	const numero = Number.parseFloat(normalizado);
	return Number.isFinite(numero) && numero > 0 ? numero : null;
}
