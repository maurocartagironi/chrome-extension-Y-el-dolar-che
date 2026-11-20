import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RateHistory } from '@shared/models/DailyClose';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { todayInArgentina } from '@shared/utils/variation.util';
import { TableComponent } from './table.component';

const RATES = [
	new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z', 'arrow-trend-up', ''),
	new ExchangeRate('oficial', 'Oficial', 1000, 1050, '2026-11-19T12:00:00.000Z', '', 'arrow-trend-down'),
];

/** Intl mete espacios duros: se normalizan para que las comparaciones se lean. */
const texto = (value: string | null | undefined) => (value ?? '').replace(/\u00a0/g, ' ');

/** Fechas relativas a hoy para que el test no se venza con el calendario. */
const diasAtras = (dias: number): string => {
	const fecha = new Date(`${todayInArgentina()}T12:00:00Z`);
	fecha.setUTCDate(fecha.getUTCDate() - dias);
	return fecha.toISOString().slice(0, 10);
};

const HISTORY: RateHistory = {
	blue: [
		{ fecha: diasAtras(4), compra: 1340, venta: 1360 },
		{ fecha: diasAtras(3), compra: 1350, venta: 1375 },
		{ fecha: diasAtras(2), compra: 1370, venta: 1390 },
		// El cierre de ayer: contra este se calcula la variación.
		{ fecha: diasAtras(1), compra: 1380, venta: 1400 },
		// La serie trae también el valor de hoy, que no sirve de referencia.
		{ fecha: diasAtras(0), compra: 1400, venta: 1450 },
	],
	oficial: [
		{ fecha: diasAtras(1), compra: 1020, venta: 1100 },
		{ fecha: diasAtras(0), compra: 1000, venta: 1050 },
	],
};

describe('TableComponent', () => {
	let component: TableComponent;
	let fixture: ComponentFixture<TableComponent>;

	const filas = () => fixture.nativeElement.querySelectorAll('tbody tr');

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TableComponent);
		component = fixture.componentInstance;
		// setInput y no asignación directa: ngOnChanges, que es donde se arman
		// las filas, solo corre cuando el input se setea como input.
		fixture.componentRef.setInput('exchangeRates', RATES);
		fixture.detectChanges();
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	it('renderiza el encabezado y una fila por cotización', () => {
		const header = fixture.nativeElement.querySelectorAll('thead th');
		expect(Array.from(header, (th: any) => th.textContent.trim())).toEqual(['Moneda', 'Compra', 'Venta']);

		expect(filas().length).toBe(2);
		expect(filas()[0].textContent).toContain('Dólar libre');
		expect(texto(filas()[0].textContent)).toContain('1.400,00');
		expect(texto(filas()[0].textContent)).toContain('1.450,00');
	});

	it('formatea los precios en pesos', () => {
		expect(texto(component.toCurrencyPesos(1400))).toContain('1.400,00');
	});

	// Las clases del chip son las que lo pintan: rojo si subió, verde si bajó.
	it('clasifica el chip según la tendencia', () => {
		expect(component.trendClass('arrow-trend-up')).toBe('up');
		expect(component.trendClass('arrow-trend-down')).toBe('down');
		expect(component.trendClass('')).toBe('neutral');
	});

	// Sin histórico todavía, el chip cae a la comparación contra el sondeo anterior.
	it('marca la tendencia en el DOM y solo dibuja la flecha si hubo cambio', () => {
		const [compraFila1, ventaFila1] = filas()[0].querySelectorAll('.price-chip');

		expect(compraFila1.classList).toContain('up');
		expect(compraFila1.querySelector('.trend-icon')).not.toBeNull();

		expect(ventaFila1.classList).toContain('neutral');
		expect(ventaFila1.querySelector('.trend-icon')).toBeNull();

		const ventaFila2 = filas()[1].querySelectorAll('.price-chip')[1];
		expect(ventaFila2.classList).toContain('down');
		expect(ventaFila2.querySelector('.trend-icon').classList).toContain('down');
	});

	it('no muestra variación mientras no haya histórico', () => {
		expect(filas()[0].querySelector('.rate-meta')).toBeNull();
	});

	describe('con el histórico cargado', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('history', HISTORY);
			fixture.detectChanges();
		});

		// 1450 contra el cierre de ayer de 1400 es +3,57 %.
		it('calcula la variación del día contra el cierre de ayer', () => {
			const meta = filas()[0].querySelector('.rate-meta');

			expect(texto(meta.querySelector('.rate-var').textContent)).toContain('3,6');
			expect(meta.classList).toContain('up');
		});

		it('marca en verde la que bajó', () => {
			const meta = filas()[1].querySelector('.rate-meta');

			expect(texto(meta.querySelector('.rate-var').textContent)).toContain('4,5');
			expect(meta.classList).toContain('down');
		});

		// El chip deja de mirar el sondeo anterior: la venta del blue no se movió
		// entre sondeos pero sí contra el cierre de ayer.
		it('pinta los chips con la variación del día, no con la del sondeo', () => {
			const [compra, venta] = filas()[0].querySelectorAll('.price-chip');

			expect(compra.classList).toContain('up');
			expect(venta.classList).toContain('up');
			expect(venta.querySelector('.trend-icon')).not.toBeNull();
		});

		it('dibuja el sparkline con un punto por cierre', () => {
			const puntos = filas()[0].querySelector('.spark polyline').getAttribute('points');

			expect(puntos.split(' ').length).toBe(HISTORY['blue'].length);
		});

		// Con dos cierres alcanza para una línea; con uno solo, no.
		it('no dibuja el sparkline si no hay al menos dos cierres', () => {
			fixture.componentRef.setInput('history', { blue: [{ fecha: diasAtras(1), compra: 1380, venta: 1400 }] } as RateHistory);
			fixture.detectChanges();

			expect(filas()[0].querySelector('.spark')).toBeNull();
			expect(filas()[0].querySelector('.rate-var')).not.toBeNull();
		});
	});

	it('copia el precio sin símbolo de moneda al hacer click', () => {
		const clipboard = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

		fixture.nativeElement.querySelector('.price-chip').click();

		expect(clipboard).toHaveBeenCalledWith('1.400,00');
	});

	// Con OnPush, el setTimeout que apaga el toast no repinta solo.
	it('muestra el toast al copiar y lo apaga a los 2 segundos', fakeAsync(() => {
		spyOn(navigator.clipboard, 'writeText').and.resolveTo();
		const toast = () => fixture.nativeElement.querySelector('.toast-notification');

		fixture.nativeElement.querySelector('.price-chip').click();
		fixture.detectChanges();
		expect(toast().textContent).toContain('copiado');

		tick(2000);
		fixture.detectChanges();
		expect(toast().textContent.trim()).toBe('');
	}));

	it('no renderiza filas si no hay cotizaciones', () => {
		const vacia = TestBed.createComponent(TableComponent);
		vacia.componentRef.setInput('exchangeRates', []);
		vacia.detectChanges();

		expect(vacia.nativeElement.querySelectorAll('tbody tr').length).toBe(0);
	});
});
