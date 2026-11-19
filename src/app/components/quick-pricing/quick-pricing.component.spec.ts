import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRate } from '@shared/models/ExchangeRate';
import { QuickPricingComponent } from './quick-pricing.component';

const RATES = [new ExchangeRate('blue', 'Dólar libre', 1000, 1250, '2026-11-19T12:00:00.000Z')];

describe('QuickPricingComponent', () => {
	let component: QuickPricingComponent;
	let fixture: ComponentFixture<QuickPricingComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [QuickPricingComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(QuickPricingComponent);
		component = fixture.componentInstance;
		component.exchangeRateList = RATES;
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	it('multiplica cuando se convierte de dólares a pesos', () => {
		component.currencyConversor = { label: 'Dólar libre a pesos', value: 'blue-ars' };
		component.config.valueConversor = 10;

		component.setResult();

		expect(component.result.get('compra')).toContain('10.000');
		expect(component.result.get('venta')).toContain('12.500');
	});

	it('divide cuando se convierte de pesos a dólares', () => {
		component.currencyConversor = { label: 'Pesos a Dólar libre', value: 'ars-blue' };
		component.config.valueConversor = 10000;

		component.setResult();

		expect(component.result.get('compra')).toContain('10,00');
		expect(component.result.get('venta')).toContain('8,00');
	});

	it('no muestra resultado si no hay valor cargado', () => {
		component.currencyConversor = { label: 'Dólar libre a pesos', value: 'blue-ars' };
		component.config.valueConversor = 0;

		component.setResult();

		expect(component.result.get('compra')).toBeUndefined();
		expect(component.result.get('venta')).toBeUndefined();
	});

	it('invierte el sentido de la conversión', async () => {
		component.picklistCurrency = [
			{ label: 'Dólar libre a pesos', value: 'blue-ars' },
			{ label: 'Pesos a Dólar libre', value: 'ars-blue' },
		];
		component.currencyConversor = component.picklistCurrency[0];

		await component.onCurrencyToggle();

		expect(component.currencyConversor.value).toBe('ars-blue');
		expect(component.config.currencyConversor).toBe('ars-blue');
	});

	it('arma el título según el sentido', () => {
		component.currencyConversor = { label: '', value: 'ars-blue' };
		expect(component.showTitleResult()).toBe('Pesos argentinos a dólar libre:');

		component.currencyConversor = { label: '', value: 'blue-ars' };
		expect(component.showTitleResult()).toBe('dólar libre a pesos argentinos:');
	});
});
