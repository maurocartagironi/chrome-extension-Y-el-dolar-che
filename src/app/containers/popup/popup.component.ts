import { Component, OnInit } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, getLocalStorage } from '@shared/utils';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
	public exchangeRateList: ExchangeRate[] = [];
	public lastUpdated: string = "";
	public realLastUpdated: Date = new Date();
	public config: Config = new Config();
	
  	constructor(public dolarApiService: DolarAPIService) {}

  	async ngOnInit() {
		this.getData();
  	}

	async getData() {
		this.config = await getLocalStorage(LOCALSTORAGE_CONFIG);
		this.exchangeRateList = await this.dolarApiService.getAll();
		const lastUpdated = calculateTimeDifference(this.exchangeRateList[0].fechaActualizacion);
		this.lastUpdated = chrome.i18n.getMessage("footer", lastUpdated);
		this.realLastUpdated = new Date();
	}

	refreshData() {
		this.getData();
	}
}
