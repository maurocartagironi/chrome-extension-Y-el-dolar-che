import { previousClose, ratioChange, todayInArgentina } from './variation.util';

const SERIE = [
	{ fecha: '2026-11-16', compra: 1570, venta: 1590 },
	{ fecha: '2026-11-17', compra: 1580, venta: 1600 },
	{ fecha: '2026-11-18', compra: 1585, venta: 1605 },
	{ fecha: '2026-11-19', compra: 1610, venta: 1630 },
];

describe('variation.util', () => {
	describe('todayInArgentina', () => {
		it('devuelve la fecha en formato YYYY-MM-DD', () => {
			expect(todayInArgentina()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		// A las 23 de Argentina en UTC ya es el día siguiente: tomar la fecha
		// UTC correría el "cierre de ayer" un día entero.
		it('usa la hora argentina y no la UTC', () => {
			const lasOnceDeLaNoche = new Date('2026-11-19T23:30:00-03:00');

			expect(lasOnceDeLaNoche.toISOString().slice(0, 10)).toBe('2026-11-20');
			expect(todayInArgentina(lasOnceDeLaNoche)).toBe('2026-11-19');
		});
	});

	describe('previousClose', () => {
		it('saltea el cierre de hoy y devuelve el anterior', () => {
			expect(previousClose(SERIE, '2026-11-19')?.fecha).toBe('2026-11-18');
		});

		// Fines de semana y feriados: el último cierre puede ser de varios días atrás.
		it('cae al último cierre disponible si ayer no hubo', () => {
			expect(previousClose(SERIE, '2026-11-23')?.fecha).toBe('2026-11-19');
		});

		it('devuelve undefined si no hay serie o si todo es de hoy en adelante', () => {
			expect(previousClose(undefined, '2026-11-19')).toBeUndefined();
			expect(previousClose([], '2026-11-19')).toBeUndefined();
			expect(previousClose(SERIE, '2026-11-16')).toBeUndefined();
		});
	});

	describe('ratioChange', () => {
		it('devuelve la proporción de cambio', () => {
			expect(ratioChange(1000, 1100)).toBeCloseTo(0.1, 10);
			expect(ratioChange(1000, 900)).toBeCloseTo(-0.1, 10);
			expect(ratioChange(1000, 1000)).toBe(0);
		});

		// Dividir por cero daría Infinity y el chip quedaría pintado al azar.
		it('devuelve null si el valor anterior no sirve de referencia', () => {
			expect(ratioChange(0, 1100)).toBeNull();
			expect(ratioChange(-5, 1100)).toBeNull();
			expect(ratioChange(Number.NaN, 1100)).toBeNull();
			expect(ratioChange(1000, Number.NaN)).toBeNull();
		});
	});
});
