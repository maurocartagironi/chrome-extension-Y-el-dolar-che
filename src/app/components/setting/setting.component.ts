import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, BadgeModule, TooltipModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent {
	constructor(private chromeService: ChromeService) {}
	
	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: any[] = [];
	public picklistCurrencyTooltip: any[] = [];
	public config: Config = new Config();
	public exchangeSelected: ExchangeRate = new ExchangeRate();
	public badgeExchangeRateType: any;
	public tooltipExchangeRateType: any;
	public badgeIsSell: boolean = false;
	public quickConversionIsHidden: boolean = false;
	public badgeBackgroundColor: String = "";
	public defaultTab: any;
	public tabs: any[] = [{label: "Cotizaciones", value: 0}, {label: "Conversión rápida", value: 1}, {label: "Configuración", value: 2}];
	public backgroundHelper: BackgroundHelper = new BackgroundHelper();

	@Output() onRefresh = new EventEmitter();
	
	refreshData() {
		this.onRefresh.emit(2);
	}
	
	async ngOnInit() {
		this.config = await getLocalStorage(LOCALSTORAGE_CONFIG) as Config;
		this.exchangeRateList.map(e => {
			this.picklistCurrency.push({ label: e.nombre, value: e.casa });
			this.picklistCurrencyTooltip.push({ label: e.nombre, value: e.casa });
		})
		this.picklistCurrency.sort((a, b) => a.label.localeCompare(b.label));
		this.picklistCurrencyTooltip.sort((a, b) => a.label.localeCompare(b.label));

		this.badgeExchangeRateType = this.picklistCurrency.find(e => e.value === this.config.badgeExchangeRateType);
		this.tooltipExchangeRateType = this.picklistCurrencyTooltip.find(e => e.value === this.config.tooltipExchangeRateType);
		this.badgeIsSell = this.config.badgeExchangeRateAction === 'sell' ? true : false;
		this.quickConversionIsHidden = this.config.hiddenConversionSection;
		this.badgeBackgroundColor = this.config.badgeBackgroundColor;
		this.defaultTab = this.tabs[this.config.defaultTab];
		
		document.getElementById('toggle')?.setAttribute('checked', this.badgeIsSell ? 'checked' : '');
		document.getElementById('toggleHideConversor')?.setAttribute('checked', this.quickConversionIsHidden ? 'checked' : '');
	}

	onSelectChange() {
		this.config.badgeExchangeRateType = this.badgeExchangeRateType.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
	}

	onSelectChangeTooltip() {
		this.config.tooltipExchangeRateType = this.tooltipExchangeRateType.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
	}
	onCheckSellOrBuy(e: any) {
		this.config.badgeExchangeRateAction = e.target?.checked ? 'sell' : 'buy';
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
	}

	setBackgroundColor(e: any) {
		this.config.badgeBackgroundColor = e.target?.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
	}

	hideQuickConversion(e: any) {
		this.config.hiddenConversionSection = e.target?.checked;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
		this.refreshData();
	}

	onSelectTab(e: any) {
		this.config.defaultTab = e.value;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.backgroundHelper.refreshData();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}

