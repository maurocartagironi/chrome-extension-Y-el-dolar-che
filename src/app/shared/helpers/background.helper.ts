import { Injectable } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { BinanceP2PService } from '@shared/services/binance-p2p.service';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, formatCurrency } from '@shared/utils/general.utils';
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@shared/utils/storage.util';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class BackgroundHelper {
	public badgeExchangeRate: ExchangeRate = new ExchangeRate();
	public tooltipExchangeRate: ExchangeRate = new ExchangeRate();
	public config: Config = new Config();
	public dolarApiService: DolarAPIService = new DolarAPIService();
	public binanceP2PService: BinanceP2PService = new BinanceP2PService();
	public exchangeRateList: ExchangeRate[] = [];

	constructor() {}

	public async init(): Promise<void> {
		try {
			const existing = await chrome.alarms.get('dolar-refresh');
			if (!existing) {
				chrome.alarms.create('dolar-refresh', {
					periodInMinutes: environment.defaultAlarmPeriodInMinutes,
				});
			}
			await this.refreshData();
		} catch (e: any) {
			chrome.action.setTitle({
				title: e.message.replace(/<p>/g, '').replace(/<\/p>/g, '\n'),
			});
			removeLocalStorage(LOCALSTORAGE_CONFIG);
		}
	}

	public async refreshData(): Promise<void> {
		const config = await getLocalStorage(LOCALSTORAGE_CONFIG);
		if (config) {
			this.config = config;
		} else {
			await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		}

		this.exchangeRateList = await this.dolarApiService.getAll();
		await this.binanceP2PService.get();
		await this.setBadgeAndTooltip();
	}

	public async setBadgeAndTooltip(exchangeRates?: ExchangeRate[]): Promise<void> {
		if (exchangeRates) {
			this.exchangeRateList = exchangeRates;
		}

		const config = await getLocalStorage(LOCALSTORAGE_CONFIG);
		if (config) {
			this.config = config;
		}

		this.badgeExchangeRate = this.exchangeRateList.find((value) => value.casa === this.config.badgeExchangeRateType)
			?? this.exchangeRateList[0];
		this.tooltipExchangeRate = this.exchangeRateList.find((value) => value.casa === this.config.tooltipExchangeRateType)
			?? this.exchangeRateList[0];

		if (!this.badgeExchangeRate || !this.tooltipExchangeRate) return;

		const badgeValue = this.config.badgeExchangeRateAction === 'sell'
			? this.badgeExchangeRate.venta
			: this.badgeExchangeRate.compra;

		chrome.action.setBadgeText({ text: badgeValue.toString() });
		chrome.action.setBadgeBackgroundColor({ color: this.config.badgeBackgroundColor.toString() });
		const title = await this.generateTooltip();
		chrome.action.setTitle({ title });
	}

	private async generateTooltip(): Promise<string> {
		const sinceDate = calculateTimeDifference(this.tooltipExchangeRate.fechaActualizacion);
		return chrome.i18n.getMessage('tooltip', [
			this.tooltipExchangeRate.nombre,
			formatCurrency(this.tooltipExchangeRate.compra.toString()).toString(),
			formatCurrency(this.tooltipExchangeRate.venta.toString()).toString(),
			sinceDate,
		]);
	}
}
