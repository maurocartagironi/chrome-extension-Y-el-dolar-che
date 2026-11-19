import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';
import { BackgroundHelper } from '@shared/helpers/background.helper';

interface Option<T> {
	label: string;
	value: T;
}

@Component({
    selector: 'app-setting',
    imports: [CommonModule, FormsModule],
    templateUrl: './setting.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {
	constructor(private chromeService: ChromeService, private changeDetector: ChangeDetectorRef) {}

	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: Option<string>[] = [];
	public config: Config = new Config();
	public badgeExchangeRateType: Option<string> | undefined;
	public tooltipExchangeRateType: Option<string> | undefined;
	public badgeIsSell: boolean = false;
	public quickConversionIsHidden: boolean = false;
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
		this.config = new Config((await getLocalStorage(LOCALSTORAGE_CONFIG)) ?? {});

		this.tabs = [
			{ label: this.chromeService.getMessage('label_quotations'), value: 0 },
			{ label: this.chromeService.getMessage('label_quick_pricing'), value: 1 },
			{ label: this.chromeService.getMessage('label_settings') || 'Configuración', value: 2 },
		];

		this.picklistCurrency = this.exchangeRateList
			.map((e) => ({ label: e.nombre, value: e.casa }))
			.sort((a, b) => a.label.localeCompare(b.label));

		this.badgeExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.badgeExchangeRateType);
		this.tooltipExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.tooltipExchangeRateType);
		this.badgeIsSell = this.config.badgeExchangeRateAction === 'sell';
		this.quickConversionIsHidden = this.config.hiddenConversionSection;
		this.badgeBackgroundColor = this.config.badgeBackgroundColor;
		this.defaultTab = this.tabs[this.config.defaultTab];
		// Con OnPush hay que marcar la vista: esto corre después de un await.
		this.changeDetector.markForCheck();
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

	async onCheckSellOrBuy(e: any) {
		this.config.badgeExchangeRateAction = e.target?.checked ? 'sell' : 'buy';
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async setBackgroundColor(e: any) {
		this.config.badgeBackgroundColor = e.target?.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
	}

	async hideQuickConversion(e: any) {
		this.config.hiddenConversionSection = e.target?.checked;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		await this.applyBadge();
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

	trackByValue(_index: number, option: Option<string | number>): string | number {
		return option.value;
	}
}
