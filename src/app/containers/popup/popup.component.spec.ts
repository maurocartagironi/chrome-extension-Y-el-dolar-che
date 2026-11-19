import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { setLocalStorage } from '@shared/utils/storage.util';
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

	describe('tabs', () => {
		/** Pinta el popup con los datos ya cargados. */
		const cargar = async () => {
			fixture.detectChanges();
			await component.getData(true);
			fixture.detectChanges();
		};

		/** Click real sobre la tab: con OnPush es lo que marca la vista. */
		const clickTab = (selector: string) => {
			const boton = fixture.nativeElement.querySelector(selector);
			expect(boton).withContext(`no encontré la tab ${selector}`).not.toBeNull();
			boton.click();
			fixture.detectChanges();
		};

		it('muestra la tab elegida', async () => {
			await cargar();

			clickTab('.tab-bar .tab-btn:nth-child(2)');

			expect(fixture.nativeElement.querySelector('app-quick-pricing')).not.toBeNull();
			expect(fixture.nativeElement.querySelector('app-setting')).toBeNull();
		});

		// El bug: al ocultar el conversor, el índice de configuración se corría a
		// 1 y chocaba con el case del conversor, así que la tab de configuración
		// mostraba el conversor.
		it('con el conversor oculto, la tab de configuración muestra configuración', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ hiddenConversionSection: true }));
			await cargar();

			// Con el conversor oculto quedan dos tabs: cotizaciones y el engranaje.
			expect(fixture.nativeElement.querySelectorAll('.tab-btn').length).toBe(2);

			clickTab('.settings-tab');

			expect(fixture.nativeElement.querySelector('app-setting')).not.toBeNull();
			expect(fixture.nativeElement.querySelector('app-quick-pricing')).toBeNull();
		});

		it('con el conversor oculto, su tab no se puede abrir', async () => {
			await cargar();
			component.config.hiddenConversionSection = true;

			component.selectTab(component.TAB_CONVERTER);
			fixture.detectChanges();

			expect(component.activeIndex).toBe(component.TAB_RATES);
			expect(fixture.nativeElement.querySelector('app-quick-pricing')).toBeNull();
		});

		it('si la tab por defecto es el conversor y está oculto, abre en cotizaciones', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ defaultTab: 1, hiddenConversionSection: true }));

			await component.getData(true);

			expect(component.activeIndex).toBe(component.TAB_RATES);
		});

		it('un refresh en cotizaciones no salta a la tab por defecto', async () => {
			await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ defaultTab: 2 }));

			component.tab = 0;
			await component.getData(true);

			expect(component.activeIndex).toBe(component.TAB_RATES);
		});
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
