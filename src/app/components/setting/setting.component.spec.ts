import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';
import { ChromeMock, installChromeMock } from 'src/testing/chrome-mock';
import { SettingComponent } from './setting.component';

const RATES = [
	new ExchangeRate('oficial', 'Oficial', 1000, 1050, '2026-11-19T12:00:00.000Z'),
	new ExchangeRate('blue', 'Dólar libre', 1400, 1450, '2026-11-19T12:00:00.000Z'),
];

/** Eventos mínimos: los handlers solo leen target.checked o target.value. */
const checkEvent = (checked: boolean) => ({ target: { checked } }) as unknown as Event;
const valueEvent = (value: string) => ({ target: { value } }) as unknown as Event;

describe('SettingComponent', () => {
	let component: SettingComponent;
	let fixture: ComponentFixture<SettingComponent>;
	let mock: ChromeMock;

	beforeEach(async () => {
		mock = installChromeMock();
		mock.i18n.messages['label_quotations'] = 'Cotizaciones';
		mock.i18n.messages['label_quick_pricing'] = 'Conversión rápida';
		mock.i18n.messages['label_settings'] = 'Configuración';
		mock.i18n.messages['label_badge_exchange_rate_desc'] = 'Elegí el tipo de cambio del indicador.';
		mock.i18n.messages['tooltip'] = '$1 compra $2 vende $3 hace $4';
		mock.i18n.messages['n_days'] = ' día(s)';

		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ badgeExchangeRateType: 'blue', tooltipExchangeRateType: 'oficial' }));

		await TestBed.configureTestingModule({
			imports: [SettingComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SettingComponent);
		component = fixture.componentInstance;
		component.exchangeRateList = RATES;

		await component.ngOnInit();
		await fixture.whenStable();
		fixture.detectChanges();
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	it('ordena las monedas alfabéticamente y marca la guardada', () => {
		expect(component.picklistCurrency.map((o) => o.label)).toEqual(['Dólar libre', 'Oficial']);
		expect(component.badgeExchangeRateType?.value).toBe('blue');
		expect(component.tooltipExchangeRateType?.value).toBe('oficial');
	});

	it('renderiza los tres selects con sus opciones', () => {
		const selects = fixture.nativeElement.querySelectorAll('select');
		expect(selects.length).toBe(3);
		expect(fixture.nativeElement.querySelectorAll('#badgeExchangeRateType option').length).toBe(2);
		expect(fixture.nativeElement.querySelectorAll('#defaultTab option').length).toBe(3);
	});

	it('cada opción tiene su tooltip de ayuda', () => {
		const tips = fixture.nativeElement.querySelectorAll('.info-tip');
		expect(tips.length).toBe(6);
		expect(tips[0].getAttribute('data-tip')).toBe('Elegí el tipo de cambio del indicador.');
	});

	// Este era el bug: cambiar el tipo de cambio no repintaba el badge.
	it('al cambiar el tipo de cambio guarda y repinta el badge', async () => {
		await component.onSelectChange({ label: 'Oficial', value: 'oficial' });

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.badgeExchangeRateType).toBe('oficial');
		expect(mock.badge.text).toBe('1000');
	});

	it('al cambiar el tooltip guarda y lo repinta', async () => {
		await component.onSelectChangeTooltip({ label: 'Dólar libre', value: 'blue' });

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.tooltipExchangeRateType).toBe('blue');
		expect(mock.badge.title).toContain('Dólar libre');
	});

	it('alterna compra y venta en el indicador', async () => {
		await component.onCheckSellOrBuy(checkEvent(true));

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.badgeExchangeRateAction).toBe('sell');
		expect(mock.badge.text).toBe('1450');
	});

	it('guarda el color del indicador', async () => {
		await component.setBackgroundColor(valueEvent('#ff0000'));

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.badgeBackgroundColor).toBe('#ff0000');
		expect(mock.badge.color).toBe('#ff0000');
	});

	it('guarda la tab por defecto', async () => {
		await component.onSelectTab({ label: 'Conversión rápida', value: 1 });

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.defaultTab).toBe(1);
	});

	it('al ocultar el conversor avisa al popup para que se reordene', async () => {
		const avisos: unknown[] = [];
		component.refresh.subscribe((value) => avisos.push(value));

		await component.hideQuickConversion(checkEvent(true));

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.hiddenConversionSection).toBeTrue();
		expect(avisos).toEqual([2]);
	});

	// La tab del conversor no existe cuando está oculto: ofrecerla como tab por
	// defecto dejaba al popup abriendo en una tab que no se puede mostrar.
	it('no ofrece el conversor como tab por defecto si está oculto', async () => {
		expect(component.tabs.map((t) => t.value)).toEqual([0, 1, 2]);

		await component.hideQuickConversion(checkEvent(true));

		expect(component.tabs.map((t) => t.value)).toEqual([0, 2]);
	});

	it('si la tab por defecto era el conversor, al ocultarlo vuelve a cotizaciones', async () => {
		component.config.defaultTab = 1;

		await component.hideQuickConversion(checkEvent(true));

		expect((await getLocalStorage<Config>(LOCALSTORAGE_CONFIG))!.defaultTab).toBe(0);
		expect(component.defaultTab?.value).toBe(0);
	});

	it('vuelve a ofrecer el conversor si se lo muestra de nuevo', async () => {
		await component.hideQuickConversion(checkEvent(true));

		await component.hideQuickConversion(checkEvent(false));

		expect(component.tabs.map((t) => t.value)).toEqual([0, 1, 2]);
	});

	it('ignora un cambio sin opción', async () => {
		await component.onSelectChange(undefined);

		expect(component.badgeExchangeRateType?.value).toBe('blue');
	});
});
