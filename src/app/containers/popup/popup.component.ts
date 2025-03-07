import { Component, OnInit, ViewChild } from '@angular/core';

import { LOCALSTORAGE_CONFIG, LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { BackgroundHelper } from '@shared/helpers/background.helper';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, getLocalStorage } from '@shared/utils';
import { setLocalStorage } from '@shared/utils/storage.util';
import { ChromeService } from '@shared/utils/chrome.utils';
import { LegalTermsComponent } from 'src/app/components/legalterms/legalterms.component';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
	@ViewChild('legal-terms') legalTerms!: LegalTermsComponent;

	public exchangeRates: ExchangeRate[] = [];
	public lastUpdated: string = '';
	public realLastUpdated: Date = new Date();
	public config: Config = new Config();
	public loading: boolean = true;
	public hasError: boolean = false;
	public errorMessage: string = '';
	public activeIndex: number = 0;
	public tab: any;

	constructor(public dolarApiService: DolarAPIService, public backgroundHelper: BackgroundHelper, public chromeService: ChromeService) {}

	async ngOnInit() {
		this.getData();
	}

	async getData() {
		try {
			if (!this.tab) {
				this.loading = true;
			}
			this.config = await getLocalStorage(LOCALSTORAGE_CONFIG);
			console.log(this.config);
			const servicesExchangeRates = await this.dolarApiService.getAll();
			const OldExchangeRates = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);

			this.updateExchangeRates(OldExchangeRates, servicesExchangeRates);

			await this.backgroundHelper.refreshData();
			const lastUpdated = calculateTimeDifference(this.exchangeRates[0].fechaActualizacion);
			this.lastUpdated = chrome.i18n.getMessage('footer', lastUpdated);
			this.realLastUpdated = new Date();
			this.loading = false;
			this.hasError = false;
			this.activeIndex = !this.tab ? this.config.defaultTab : this.tab;
		} catch (error: any) {
			this.loading = false;
			this.hasError = true;
			this.errorMessage = error.message;
		}
	}

	refreshData(tab?: any) {
		this.tab = tab;
		this.getData();
		this.activeIndex = tab ? tab : 0;
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}

	async updateExchangeRates(exchangeRatesOld: ExchangeRate[], exchangeRatesNew: ExchangeRate[]) {
		if (exchangeRatesOld === undefined) {
			this.exchangeRates = exchangeRatesNew;
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, this.exchangeRates);
		}
		let exchangeRatesUpdated: ExchangeRate[] = exchangeRatesNew.map((exchangeRate) => {
			const oldExchange = exchangeRatesOld.find((e: any) => e.casa === exchangeRate.casa);

			if (oldExchange) {
				if (oldExchange.fechaActualizacion !== exchangeRate.fechaActualizacion) {
					let updatedCompra = oldExchange.updatedCompra;
					let updatedVenta = oldExchange.updatedVenta;

					if (oldExchange.compra < exchangeRate.compra) {
						updatedCompra = 'arrow-trend-up';
					} else if (oldExchange.compra > exchangeRate.compra) {
						updatedCompra = 'arrow-trend-down';
					} else {
						updatedCompra = '';
					}

					if (oldExchange.venta < exchangeRate.venta) {
						updatedVenta = 'arrow-trend-up';
					} else if (oldExchange.venta > exchangeRate.venta) {
						updatedVenta = 'arrow-trend-down';
					} else {
						updatedVenta = '';
					}

					return new ExchangeRate(
						exchangeRate.casa,
						exchangeRate.nombre,
						exchangeRate.compra,
						exchangeRate.venta,
						exchangeRate.fechaActualizacion,
						updatedCompra,
						updatedVenta
					);
				} else {
					return oldExchange;
				}
			}

			return exchangeRate;
		});

		this.exchangeRates = exchangeRatesUpdated;
		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, this.exchangeRates);
	}
}
