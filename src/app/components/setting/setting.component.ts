import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChromeService } from '@shared/utils/chrome.utils';
import { BackgroundHelper } from '@shared/helpers/background.helper';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-setting',
	standalone: true,
	imports: [CommonModule, FormsModule, NgSelectModule, BadgeModule, TooltipModule],
	templateUrl: './setting.component.html',
	styleUrl: './setting.component.scss',
})
export class SettingComponent implements OnInit {
	constructor(private chromeService: ChromeService) {}

	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: any[] = [];
	public picklistCurrencyTooltip: any[] = [];
	public config: Config = new Config();
	public badgeExchangeRateType: any;
	public tooltipExchangeRateType: any;
	public badgeIsSell: boolean = false;
	public quickConversionIsHidden: boolean = false;
	public badgeBackgroundColor: string = '';
	public defaultTab: any;
	public tabs: any[] = [];
	public backgroundHelper: BackgroundHelper = new BackgroundHelper();

	@Output() onRefresh = new EventEmitter();

	ngOnInit() {
		this.initialize();
	}

	private async initialize() {
		this.config = (await getLocalStorage(LOCALSTORAGE_CONFIG)) as Config;

		this.tabs = [
			{ label: this.chromeService.getMessage('label_quotations'), value: 0 },
			{ label: this.chromeService.getMessage('label_quick_pricing'), value: 1 },
			{ label: this.chromeService.getMessage('label_settings') || 'Configuración', value: 2 },
		];

		this.exchangeRateList.forEach((e) => {
			this.picklistCurrency.push({ label: e.nombre, value: e.casa });
			this.picklistCurrencyTooltip.push({ label: e.nombre, value: e.casa });
		});
		this.picklistCurrency.sort((a, b) => a.label.localeCompare(b.label));
		this.picklistCurrencyTooltip.sort((a, b) => a.label.localeCompare(b.label));

		this.badgeExchangeRateType = this.picklistCurrency.find((e) => e.value === this.config.badgeExchangeRateType);
		this.tooltipExchangeRateType = this.picklistCurrencyTooltip.find((e) => e.value === this.config.tooltipExchangeRateType);
		this.badgeIsSell = this.config.badgeExchangeRateAction === 'sell';
		this.quickConversionIsHidden = this.config.hiddenConversionSection;
		this.badgeBackgroundColor = this.config.badgeBackgroundColor;
		this.defaultTab = this.tabs[this.config.defaultTab];
	}

	refreshData() {
		this.onRefresh.emit(2);
	}

	onSelectChange() {
		this.config.badgeExchangeRateType = this.badgeExchangeRateType.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.setBadgeAndTooltip();
	}

	onSelectChangeTooltip() {
		this.config.tooltipExchangeRateType = this.tooltipExchangeRateType.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.setBadgeAndTooltip();
	}

	onCheckSellOrBuy(e: any) {
		this.config.badgeExchangeRateAction = e.target?.checked ? 'sell' : 'buy';
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.setBadgeAndTooltip();
	}

	setBackgroundColor(e: any) {
		this.config.badgeBackgroundColor = e.target?.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.setBadgeAndTooltip();
	}

	hideQuickConversion(e: any) {
		this.config.hiddenConversionSection = e.target?.checked;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.setBadgeAndTooltip();
		this.refreshData();
	}

	onSelectTab(e: any) {
		this.config.defaultTab = e.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
