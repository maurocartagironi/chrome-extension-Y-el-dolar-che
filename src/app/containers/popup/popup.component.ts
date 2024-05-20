import { Component, OnInit } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { BackgroundHelper } from '@shared/helpers/background.helper';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, getLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
	public exchangeRates: ExchangeRate[] = [];
	public lastUpdated: string = "";
	public realLastUpdated: Date = new Date();
	public config: Config = new Config();
	public loading: boolean = true;
	public hasError: boolean = false;
	public errorMessage: string = "";
	public activeIndex: number = 0;
	
  	constructor(public dolarApiService: DolarAPIService, public backgroundHelper: BackgroundHelper, public chromeService: ChromeService) {}

  	async ngOnInit() {
		this.getData();
  	}

	async getData() {
		try {
			this.loading = true;
			this.config = await getLocalStorage(LOCALSTORAGE_CONFIG);
			this.exchangeRates = await this.dolarApiService.getAll();
			await this.backgroundHelper.setBadgeAndTooltip(this.exchangeRates);
			const lastUpdated = calculateTimeDifference(this.exchangeRates[0].fechaActualizacion);
			this.lastUpdated = chrome.i18n.getMessage("footer", lastUpdated);
			this.realLastUpdated = new Date();
			this.loading = false;
			this.hasError = false;
		} catch (error: any) {
			this.loading = false;
			this.hasError = true;
			this.errorMessage = error.message;
		}
	}

	refreshData() {
		this.getData();
		this.activeIndex = 0;
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
