import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ExchangeRate } from '@shared/models/ExchangeRate';
import { TableComponent } from './table.component';

const RATES = [
	new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z', 'arrow-trend-up', ''),
	new ExchangeRate('oficial', 'Oficial', 1000, 1050, '2026-11-19T12:00:00.000Z'),
];

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

	it('renderiza una tarjeta por cotización', () => {
		const cards = fixture.nativeElement.querySelectorAll('.rate-card');
		expect(cards.length).toBe(2);
		expect(cards[0].textContent).toContain('Dólar libre');
	});

	it('formatea los precios en pesos', () => {
		expect(component.toCurrencyPesos(1400).replace(/ /g, ' ')).toContain('1.400,00');
	});

	it('muestra la flecha de tendencia cuando corresponde', () => {
		const [primera, segunda] = fixture.nativeElement.querySelectorAll('.rate-card');
		expect(primera.querySelector('.pi-arrow-up')).not.toBeNull();
		expect(segunda.querySelector('.pi-arrow-up')).toBeNull();
		expect(segunda.querySelector('.pi-arrow-down')).toBeNull();
	});

	// Con OnPush, el setTimeout que apaga el toast no repinta solo. Se hace el
	// click real sobre el chip, que es el camino que usa la extensión.
	it('muestra el toast al copiar y lo apaga a los 2 segundos', fakeAsync(() => {
		spyOn(navigator.clipboard, 'writeText').and.resolveTo();
		const toast = () => fixture.nativeElement.querySelector('.toast-notification');

		fixture.nativeElement.querySelector('.price-chip').click();
		fixture.detectChanges();
		expect(component.copiedText).toContain('copiado');
		expect(toast().textContent).toContain('copiado');

		tick(2000);
		fixture.detectChanges();
		expect(component.copiedText).toBe('');
		expect(toast().textContent.trim()).toBe('');
	}));

	it('copia el precio sin símbolo de moneda', () => {
		const clipboard = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

		component.copyPrice(1400.5);

		expect(clipboard).toHaveBeenCalledWith('1.400,50');
	});
});
