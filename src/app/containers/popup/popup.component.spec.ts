import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRate } from '@shared/models/ExchangeRate';
import { installChromeMock } from 'src/testing/chrome-mock';
import { PopupComponent } from './popup.component';

const PAYLOAD = [{ casa: 'blue', nombre: 'Dólar libre', compra: 1400, venta: 1450, fechaActualizacion: '2026-11-19T12:00:00.000Z' }];

describe('PopupComponent', () => {
	let component: PopupComponent;
	let fixture: ComponentFixture<PopupComponent>;

	beforeEach(async () => {
		const mock = installChromeMock();
		mock.i18n.messages['footer'] = 'Actualizado hace $1';
		mock.i18n.messages['n_days'] = ' día(s)';

		spyOn(window, 'fetch').and.resolveTo({
			ok: true,
			status: 200,
			statusText: 'OK',
			json: async () => PAYLOAD,
		} as Response);

		await TestBed.configureTestingModule({
			imports: [PopupComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(PopupComponent);
		component = fixture.componentInstance;
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	// Con OnPush, si getData() no marcara la vista, el popup quedaría en el
	// skeleton de carga para siempre.
	it('pinta las cotizaciones en el DOM al terminar de cargar', async () => {
		fixture.detectChanges();

		await component.getData(true);
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.skeleton-wrapper')).toBeNull();
		expect(fixture.nativeElement.querySelector('app-table')).not.toBeNull();
		expect(fixture.nativeElement.textContent).toContain('Dólar libre');
	});

	it('muestra la tarjeta de error en el DOM si falla', async () => {
		fixture.detectChanges();
		(window.fetch as jasmine.Spy).and.rejectWith(new Error('sin red'));

		await component.getData(true);
		fixture.detectChanges();

		const card = fixture.nativeElement.querySelector('.error-card');
		expect(card).not.toBeNull();
		expect(card.textContent).toContain('No se pudo obtener la cotización');
	});

	it('carga las cotizaciones y sale del estado de carga', async () => {
		await component.getData(true);

		expect(component.exchangeRates.length).toBe(1);
		expect(component.loading).toBeFalse();
		expect(component.hasError).toBeFalse();
		expect(component.lastUpdated).toContain('Actualizado hace');
	});

	it('muestra el error si no hay datos ni caché', async () => {
		(window.fetch as jasmine.Spy).and.rejectWith(new Error('sin red'));

		await component.getData(true);

		expect(component.hasError).toBeTrue();
		expect(component.errorMessage).toContain('No se pudo obtener la cotización');
	});

	it('ignora un pedido abortado en lugar de mostrarlo como error', async () => {
		const aborted = new DOMException('Aborted', 'AbortError');
		(window.fetch as jasmine.Spy).and.rejectWith(aborted);

		await component.getData(true);

		expect(component.hasError).toBeFalse();
	});

	describe('updateExchangeRates', () => {
		const anterior = [new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z')];

		it('marca la tendencia cuando el precio cambia', async () => {
			const nuevo = [new ExchangeRate('blue', 'Dólar libre', 1500, 1400, '2026-11-19T13:00:00.000Z')];

			await component.updateExchangeRates(anterior, nuevo);

			expect(component.exchangeRates[0].updatedCompra).toBe('arrow-trend-up');
			expect(component.exchangeRates[0].updatedVenta).toBe('arrow-trend-down');
		});

		it('mantiene la entrada anterior si la fecha no cambió', async () => {
			const nuevo = [new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z')];

			await component.updateExchangeRates(anterior, nuevo);

			expect(component.exchangeRates[0]).toBe(anterior[0]);
		});

		it('usa los nuevos tal cual si no había nada guardado', async () => {
			const nuevo = [new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z')];

			await component.updateExchangeRates([], nuevo);

			expect(component.exchangeRates).toBe(nuevo);
		});
	});
});
