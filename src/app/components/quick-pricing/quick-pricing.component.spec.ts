import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { setLocalStorage } from '@shared/utils/storage.util';
import { installChromeMock } from 'src/testing/chrome-mock';
import { QuickPricingComponent } from './quick-pricing.component';

const RATES = [new ExchangeRate('blue', 'Dólar libre', 1000, 1250, '2026-11-19T12:00:00.000Z')];

/** Intl mete espacios duros: se normalizan para que las comparaciones se lean. */
const texto = (value: string | undefined) => (value ?? '').replace(/ /g, ' ');

describe('QuickPricingComponent', () => {
	let component: QuickPricingComponent;
	let fixture: ComponentFixture<QuickPricingComponent>;

	beforeEach(async () => {
		installChromeMock();

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

	describe('input de monto', () => {
		// Reemplaza el enmascarado de p-inputNumber: esta es la lógica propia.
		it('agrupa los miles mientras se tipea', async () => {
			await component.onAmountInput('1234567');

			expect(texto(component.amountText)).toBe('$ 1.234.567');
			expect(component.config.valueConversor).toBe(1234567);
		});

		it('deja tipear la coma y los decimales', async () => {
			await component.onAmountInput('1234,');
			expect(texto(component.amountText)).toBe('$ 1.234,');

			await component.onAmountInput('1234,5');
			expect(texto(component.amountText)).toBe('$ 1.234,5');
			expect(component.config.valueConversor).toBe(1234.5);
		});

		it('corta en dos decimales', async () => {
			await component.onAmountInput('10,5678');

			expect(texto(component.amountText)).toBe('$ 10,56');
			expect(component.config.valueConversor).toBe(10.56);
		});

		it('ignora lo que no sea dígito o coma', async () => {
			await component.onAmountInput('abc12x3$');

			expect(texto(component.amountText)).toBe('$ 123');
			expect(component.config.valueConversor).toBe(123);
		});

		it('saca los ceros a la izquierda', async () => {
			await component.onAmountInput('007');

			expect(texto(component.amountText)).toBe('$ 7');
			expect(component.config.valueConversor).toBe(7);
		});

		it('vacía el monto cuando se borra todo', async () => {
			await component.onAmountInput('100');
			await component.onAmountInput('');

			expect(component.amountText).toBe('');
			expect(component.config.valueConversor).toBe(0);
		});

		it('muestra el monto guardado al abrir', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ valueConversor: 1500, currencyConversor: 'blue-ars' }));

			await component.ngOnInit();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(texto(component.amountText)).toBe('$ 1.500');
			expect(texto(fixture.nativeElement.querySelector('.amount-input').value)).toBe('$ 1.500');
		});
	});

	describe('conversión', () => {
		it('multiplica cuando se convierte de dólares a pesos', () => {
			component.currencyConversor = { label: 'Dólar libre a pesos', value: 'blue-ars' };
			component.config.valueConversor = 10;

			component.setResult();

			expect(texto(component.result.get('compra'))).toContain('10.000');
			expect(texto(component.result.get('venta'))).toContain('12.500');
		});

		it('divide cuando se convierte de pesos a dólares', () => {
			component.currencyConversor = { label: 'Pesos a Dólar libre', value: 'ars-blue' };
			component.config.valueConversor = 10000;

			component.setResult();

			expect(texto(component.result.get('compra'))).toContain('10,00');
			expect(texto(component.result.get('venta'))).toContain('8,00');
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

			expect(component.currencyConversor?.value).toBe('ars-blue');
			expect(component.config.currencyConversor).toBe('ars-blue');
		});

		it('arma el título según el sentido', () => {
			component.currencyConversor = { label: '', value: 'ars-blue' };
			expect(component.showTitleResult()).toBe('Pesos argentinos a dólar libre:');

			component.currencyConversor = { label: '', value: 'blue-ars' };
			expect(component.showTitleResult()).toBe('dólar libre a pesos argentinos:');
		});
	});

	describe('select de moneda', () => {
		it('guarda la opción elegida y recalcula', async () => {
			component.config.valueConversor = 10;

			await component.onSelectChange({ label: 'Dólar libre a pesos', value: 'blue-ars' });

			expect(component.config.currencyConversor).toBe('blue-ars');
			expect(texto(component.result.get('compra'))).toContain('10.000');
		});

		it('renderiza una opción por sentido de conversión', async () => {
			await component.ngOnInit();
			await fixture.whenStable();
			fixture.detectChanges();

			const options = fixture.nativeElement.querySelectorAll('.currency-select option');
			expect(options.length).toBe(2);
			expect(Array.from(options, (o: any) => o.textContent.trim()).sort()).toEqual([
				'Dólar libre a pesos',
				'Pesos a Dólar libre',
			]);
		});
	});
});
