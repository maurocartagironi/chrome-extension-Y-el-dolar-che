import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ExchangeRate } from '@shared/models/ExchangeRate';
import { TableComponent } from './table.component';

const RATES = [
	new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z', 'arrow-trend-up', ''),
	new ExchangeRate('oficial', 'Oficial', 1000, 1050, '2026-11-19T12:00:00.000Z', '', 'arrow-trend-down'),
];

/** Intl mete espacios duros: se normalizan para que las comparaciones se lean. */
const texto = (value: string | null | undefined) => (value ?? '').replace(/\u00a0/g, ' ');

describe('TableComponent', () => {
	let component: TableComponent;
	let fixture: ComponentFixture<TableComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TableComponent);
		component = fixture.componentInstance;
		component.exchangeRates = RATES;
		fixture.detectChanges();
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	it('renderiza el encabezado y una fila por cotización', () => {
		const header = fixture.nativeElement.querySelectorAll('thead th');
		expect(Array.from(header, (th: any) => th.textContent.trim())).toEqual(['Moneda', 'Compra', 'Venta']);

		const rows = fixture.nativeElement.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);
		expect(rows[0].textContent).toContain('Dólar libre');
		expect(texto(rows[0].textContent)).toContain('1.400,00');
		expect(texto(rows[0].textContent)).toContain('1.450,00');
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

	it('marca la tendencia en el DOM y solo dibuja la flecha si hubo cambio', () => {
		const rows = fixture.nativeElement.querySelectorAll('tbody tr');
		const [compraFila1, ventaFila1] = rows[0].querySelectorAll('.price-chip');

		expect(compraFila1.classList).toContain('up');
		expect(compraFila1.querySelector('.trend-icon')).not.toBeNull();

		expect(ventaFila1.classList).toContain('neutral');
		expect(ventaFila1.querySelector('.trend-icon')).toBeNull();

		const ventaFila2 = rows[1].querySelectorAll('.price-chip')[1];
		expect(ventaFila2.classList).toContain('down');
		expect(ventaFila2.querySelector('.trend-icon').classList).toContain('down');
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
		vacia.componentInstance.exchangeRates = [];
		vacia.detectChanges();

		expect(vacia.nativeElement.querySelectorAll('tbody tr').length).toBe(0);
	});
});
