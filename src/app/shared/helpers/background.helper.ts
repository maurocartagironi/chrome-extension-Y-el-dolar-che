import { Injectable } from "@angular/core";
import { LOCALSTORAGE_CONFIG } from "@shared/constants/storage.constant";
import { Config } from "@shared/models/Config";
import { ExchangeRate } from "@shared/models/ExchangeRate";
import { DolarAPIService } from "@shared/services/dolar-api.service";
import { calculateTimeDifference, formatCurrency } from "@shared/utils/general.utils";
import { removeLocalStorage, setLocalStorage } from "@shared/utils/storage.util";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: 'root',
})

export class BackgroundHelper {
	public badgeExchangeRate: ExchangeRate = new ExchangeRate();
	public tooltipExchangeRate: ExchangeRate = new ExchangeRate();
	public config: Config = new Config();
	public dolarApiService: DolarAPIService = new DolarAPIService();

	constructor() {}

	public async init(): Promise<void> {
		try {
			chrome.alarms.create({
				periodInMinutes: environment.defaultAlarmPeriodInMinutes,
			});
			await this.setBadgeAndTooltip();
			setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		} catch (e: any) {
			chrome.action.setTitle({title: e.message});
			removeLocalStorage(LOCALSTORAGE_CONFIG);
			console.error(e);
		} 
	}

	public async refreshData(): Promise<void> {
		console.log('Refreshing data... ' + new Date().toLocaleString());
		this.dolarApiService = new DolarAPIService();
		await this.setBadgeAndTooltip();
	}

	private async setBadgeAndTooltip(): Promise<void> {
		this.badgeExchangeRate = await this.dolarApiService.getByType(this.config.badgeExchangeRateType);
		this.tooltipExchangeRate = await this.dolarApiService.getByType(this.config.tooltipExchangeRateType);
		chrome.action.setBadgeText({
			text: this.config.badgeExchangeRateAction === 'sell' ? this.badgeExchangeRate.sell.toString() : this.badgeExchangeRate.buy.toString()
		});
		chrome.action.setBadgeBackgroundColor({
			color: this.config.badgeBackgroundColor.toString()
		});
		const title = await this.generateTooltip();
		chrome.action.setTitle({title});
	}

	private async generateTooltip(): Promise<string> {
		const sinceDate = calculateTimeDifference(this.tooltipExchangeRate.lastUpdated);
		return chrome.i18n.getMessage("tooltip", [
			this.tooltipExchangeRate.name,
			formatCurrency(this.tooltipExchangeRate.buy).toString(),
			formatCurrency(this.tooltipExchangeRate.sell).toString(),
			sinceDate,
		]);
	}
}