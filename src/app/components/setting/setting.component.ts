import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_ALERT_FIRED, LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config, ConfigOptions } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';
import { InfoTipComponent } from '../info-tip/info-tip.component';
import { BackgroundHelper } from '@shared/helpers/background.helper';

interface Option<T> {
	label: string;
	value: T;
}

@Component({
	selector: 'app-setting',
	imports: [FormsModule, InfoTipComponent],
	templateUrl: './setting.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './setting.component.scss',
})
export class SettingComponent implements OnInit {
	private chromeService = inject(ChromeService);
	private changeDetector = inject(ChangeDetectorRef);

	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: Option<string>[] = [];
	public config: Config = new Config();
	public badgeExchangeRateType: Option<string> | undefined;
	public tooltipExchangeRateType: Option<string> | undefined;
	public badgeIsSell: boolean = false;
	public quickConversionIsHidden: boolean = false;
	public otherCurrenciesAreShown: boolean = false;
	public alertIsEnabled: boolean = false;
	public alertExchangeRateType: Option<string> | undefined;
	public alertDirection: string = 'above';
	public alertValue: number = 0;
	/** El precio de hoy, de guía para saber qué valor poner. */
	public alertPlaceholder: string = '';
	public badgeBackgroundColor: string = '';
	public defaultTab: Option<number> | undefined;
	public tabs: Option<number>[] = [];
	public backgroundHelper: BackgroundHelper = new BackgroundHelper();

	@Output() refresh = new EventEmitter();

	ngOnInit() {
		this.initialize();
	}

	private async initialize() {
		// Rehidratar con el constructor: lo guardado puede ser de una versión con menos campos.
		this.config = new Config((await getLocalStorage<ConfigOptions>(LOCALSTORAGE_CONFIG)) ?? {});

		this.buildTabs();

		this.picklistCurrency = this.exchangeRateList
			.map((e) => ({ label: e.nombre, value: e.casa }))
			.sort((a, b) => a.label.localeCompare(b.label));

		this.badgeExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.badgeExchangeRateType);
		this.tooltipExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.tooltipExchangeRateType);
		this.badgeIsSell = this.config.badgeExchangeRateAction === 'sell';
		this.quickConversionIsHidden = this.config.hiddenConversionSection;
		this.otherCurrenciesAreShown = this.config.showOtherCurrencies;
		this.alertIsEnabled = this.config.alertEnabled;
		this.alertExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.alertExchangeRateType);
		this.alertDirection = this.config.alertDirection;
		this.alertValue = this.config.alertValue;
		this.updateAlertPlaceholder();
		this.badgeBackgroundColor = this.config.badgeBackgroundColor;
		// Con OnPush hay que marcar la vista: esto corre después de un await.
		this.changeDetector.markForCheck();
	}

	/**
	 * Las opciones de "tab por defecto". Si el conversor está oculto su tab no
	 * existe, así que tampoco se ofrece acá.
	 */
	private buildTabs(): void {
		const todas: Option<number>[] = [
			{ label: this.chromeService.getMessage('label_quotations'), value: 0 },
			{ label: this.chromeService.getMessage('label_quick_pricing'), value: 1 },
			{ label: this.chromeService.getMessage('label_settings') || 'Configuración', value: 2 },
		];

		this.tabs = todas.filter((tab) => tab.value !== 1 || !this.config.hiddenConversionSection);
		this.defaultTab = this.tabs.find((tab) => tab.value === this.config.defaultTab) ?? this.tabs[0];
	}

	refreshData() {
		this.refresh.emit(2);
	}

	/** Repinta badge y tooltip con la lista que ya tiene el componente. */
	private applyBadge(): Promise<void> {
		return this.backgroundHelper.setBadgeAndTooltip(this.exchangeRateList);
	}

	async onSelectChange(option: Option<string> | undefined) {
		if (!option) return;
		this.badgeExchangeRateType = option;
		this.config.badgeExchangeRateType = option.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async onSelectChangeTooltip(option: Option<string> | undefined) {
		if (!option) return;
		this.tooltipExchangeRateType = option;
		this.config.tooltipExchangeRateType = option.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async onCheckSellOrBuy(e: Event) {
		this.config.badgeExchangeRateAction = (e.target as HTMLInputElement).checked ? 'sell' : 'buy';
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async setBackgroundColor(e: Event) {
		this.config.badgeBackgroundColor = (e.target as HTMLInputElement).value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async hideQuickConversion(e: Event) {
		this.config.hiddenConversionSection = (e.target as HTMLInputElement).checked;
		// Si la tab por defecto era el conversor y se acaba de ocultar, deja de
		// existir: se vuelve a cotizaciones.
		if (this.config.hiddenConversionSection && this.config.defaultTab === 1) {
			this.config.defaultTab = 0;
		}
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.buildTabs();
		await this.applyBadge();
		this.changeDetector.markForCheck();
		this.refreshData();
	}

	/**
	 * Cambiar cualquier cosa del aviso borra la marca de "ya avisé": si no, con
	 * la condición cumplida desde antes el aviso nuevo nunca se dispararía.
	 */
	private async saveAlert(): Promise<void> {
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await removeLocalStorage(LOCALSTORAGE_ALERT_FIRED);
	}

	async toggleAlert(e: Event) {
		this.config.alertEnabled = (e.target as HTMLInputElement).checked;
		this.alertIsEnabled = this.config.alertEnabled;
		await this.saveAlert();
		this.changeDetector.markForCheck();
	}

	async onSelectChangeAlert(option: Option<string> | undefined) {
		if (!option) return;
		this.alertExchangeRateType = option;
		this.config.alertExchangeRateType = option.value;
		this.updateAlertPlaceholder();
		await this.saveAlert();
	}

	private updateAlertPlaceholder(): void {
		const rate = this.exchangeRateList.find((e) => e.casa === this.config.alertExchangeRateType);
		this.alertPlaceholder = rate ? String(Math.round(rate.venta)) : '';
	}

	async onSelectDirection(direction: string) {
		this.alertDirection = direction;
		this.config.alertDirection = direction;
		await this.saveAlert();
	}

	async onAlertValueChange(value: number | string | null) {
		const numero = Number(value);
		this.alertValue = Number.isFinite(numero) && numero > 0 ? numero : 0;
		this.config.alertValue = this.alertValue;
		await this.saveAlert();
	}

	/**
	 * Al prender o apagar las otras monedas hay que volver a pedir los datos:
	 * la tabla, el indicador y el conversor salen todos de la misma lista.
	 */
	async toggleOtherCurrencies(e: Event) {
		this.config.showOtherCurrencies = (e.target as HTMLInputElement).checked;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.refreshData();
	}

	async onSelectTab(option: Option<number> | undefined) {
		if (!option) return;
		this.defaultTab = option;
		this.config.defaultTab = option.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
