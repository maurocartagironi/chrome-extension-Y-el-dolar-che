import { installChromeMock } from 'src/testing/chrome-mock';
import { calculateTimeDifference, formatCurrency } from './general.utils';

describe('formatCurrency', () => {
	it('formatea números y strings en pesos', () => {
		expect(formatCurrency(1480.5).replace(/\u00a0/g, ' ')).toContain('1.480,50');
		expect(formatCurrency('1480.5').replace(/\u00a0/g, ' ')).toContain('1.480,50');
	});

	it('devuelve vacío para valores que no sirven', () => {
		expect(formatCurrency(0)).toBe('');
		expect(formatCurrency('')).toBe('');
		expect(formatCurrency('no es un número')).toBe('');
		expect(formatCurrency(Infinity)).toBe('');
	});
});

describe('calculateTimeDifference', () => {
	beforeEach(() => {
		const mock = installChromeMock();
		mock.i18n.messages['n_days'] = ' día(s)';
		mock.i18n.messages['n_hours'] = ' hora(s)';
		mock.i18n.messages['n_mins'] = ' minuto(s)';
		mock.i18n.messages['n_secs'] = ' segundo(s)';
	});

	it('elige la unidad más grande que aplique', () => {
		const minutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
		const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
		const daysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

		expect(calculateTimeDifference(minutesAgo)).toBe('5 minuto(s)');
		expect(calculateTimeDifference(hoursAgo)).toBe('3 hora(s)');
		expect(calculateTimeDifference(daysAgo)).toBe('2 día(s)');
	});

	it('acepta Date además de string', () => {
		expect(calculateTimeDifference(new Date(Date.now() - 30 * 1000))).toBe('30 segundo(s)');
	});

	it('no devuelve tiempos negativos si la fecha está en el futuro', () => {
		const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
		expect(calculateTimeDifference(future)).toBe('0 segundo(s)');
	});

	it('devuelve vacío si la fecha no se puede parsear', () => {
		expect(calculateTimeDifference('cualquier cosa')).toBe('');
	});
});
