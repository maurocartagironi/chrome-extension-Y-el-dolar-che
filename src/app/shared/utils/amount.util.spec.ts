import { parseAmount } from './amount.util';

describe('parseAmount', () => {
	it('lee un número pelado', () => {
		expect(parseAmount('250')).toBe(250);
		expect(parseAmount('  42  ')).toBe(42);
	});

	it('ignora símbolos, letras y espacios alrededor', () => {
		expect(parseAmount('USD 250')).toBe(250);
		expect(parseAmount('$1.250,50')).toBe(1250.5);
		expect(parseAmount('cuesta 300 dólares')).toBe(300);
	});

	// Según quién escribió la página, el punto agrupa miles o separa decimales.
	it('resuelve el formato con los dos separadores', () => {
		expect(parseAmount('1.250,50')).toBe(1250.5);
		expect(parseAmount('1,250.50')).toBe(1250.5);
		expect(parseAmount('1.234.567,89')).toBe(1234567.89);
		expect(parseAmount('1,234,567.89')).toBe(1234567.89);
	});

	// Con un solo separador decide por la cantidad de dígitos que lo siguen.
	it('distingue miles de decimales cuando hay un solo separador', () => {
		expect(parseAmount('1.500')).toBe(1500);
		expect(parseAmount('1,500')).toBe(1500);
		expect(parseAmount('1.50')).toBe(1.5);
		expect(parseAmount('1,5')).toBe(1.5);
		expect(parseAmount('1.234.567')).toBe(1234567);
	});

	it('devuelve null si no hay un número usable', () => {
		expect(parseAmount('')).toBeNull();
		expect(parseAmount('sin números')).toBeNull();
		expect(parseAmount(',')).toBeNull();
		expect(parseAmount('0')).toBeNull();
		expect(parseAmount(undefined as unknown as string)).toBeNull();
	});
});
