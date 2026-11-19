import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';

import { LOCALSTORAGE_CONFIG, LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { BackgroundHelper } from '@shared/helpers/background.helper';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, evaluateDarkMode, getLocalStorage } from '@shared/utils';
import { setLocalStorage } from '@shared/utils/storage.util';
import { ChromeService } from '@shared/utils/chrome.utils';
import { LegalTermsComponent } from 'src/app/components/legalterms/legalterms.component';
import { HeaderComponent } from '../../components/header/header.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { TableComponent } from '../../components/table/table.component';
import { QuickPricingComponent } from '../../components/quick-pricing/quick-pricing.component';
import { SettingComponent } from '../../components/setting/setting.component';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	providers: [DolarAPIService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./popup.component.scss'],
	imports: [
		NgIf,
		NgFor,
		NgSwitch,
		NgSwitchCase,
		HeaderComponent,
		TableComponent,
		QuickPricingComponent,
		SettingComponent,
		LegalTermsComponent,
	],
})
export class PopupComponent implements OnInit {
	dolarApiService = inject(DolarAPIService);
	chromeService = inject(ChromeService);
	private changeDetector = inject(ChangeDetectorRef);

	@ViewChild('legalTerms') legalTerms!: LegalTermsComponent;

	public exchangeRates: ExchangeRate[] = [];
	public lastUpdated: string = '';
	public realLastUpdated: Date = new Date();
	public config: Config = new Config();
	public loading: boolean = true;
	public hasError: boolean = false;
	public errorMessage: string = '';
	public isDarkMode: boolean = false;
	public activeIndex: number = 0;
	public tab: any;
	public currentTab = this.config.defaultTab;

	public backgroundHelper: BackgroundHelper = new BackgroundHelper();

	ngOnInit() {
		this.getData();
	}

	async getData(forceRefresh = false) {
		try {
			if (!this.tab) {
				this.loading = true;
			}
			// Rehidratar con el constructor: lo guardado puede ser de una versión con menos campos.
			this.config = new Config((await getLocalStorage(LOCALSTORAGE_CONFIG)) ?? {});

			this.isDarkMode = evaluateDarkMode(this.config.darkMode);

			const oldExchangeRates = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);
			const servicesExchangeRates = await this.dolarApiService.getAll(forceRefresh);

			await this.updateExchangeRates(oldExchangeRates, servicesExchangeRates);

			await this.backgroundHelper.setBadgeAndTooltip(this.exchangeRates);
			const lastUpdated = calculateTimeDifference(this.exchangeRates[0].fechaActualizacion);
			this.lastUpdated = this.chromeService.getMessage('footer', lastUpdated);
			this.realLastUpdated = new Date();
			this.loading = false;
			this.hasError = false;
			this.activeIndex = !this.tab ? this.config.defaultTab : this.tab;
			// Con OnPush hay que marcar la vista: esto corre después de un await.
			this.changeDetector.markForCheck();
		} catch (error: any) {
			// Un AbortError significa que ya salió un pedido más nuevo: ese actualiza la vista.
			if (error?.name === 'AbortError') return;
			this.loading = false;
			this.hasError = true;
			this.errorMessage = error?.message ?? this.chromeService.getMessage('error_general_title');
			// Con OnPush hay que marcar la vista: esto corre después de un await.
			this.changeDetector.markForCheck();
		}
	}

	get settingsTabIndex(): number {
		return this.config.hiddenConversionSection ? 1 : 2;
	}

	onTabChange(event: any) {
		this.currentTab = event;
	}

	refreshData(tab?: any, forceRefresh = false) {
		this.tab = tab;
		this.getData(forceRefresh);
		this.activeIndex = tab ?? 0;
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}

	async updateExchangeRates(exchangeRatesOld: ExchangeRate[], exchangeRatesNew: ExchangeRate[]) {
		if (!exchangeRatesOld?.length) {
			this.exchangeRates = exchangeRatesNew;
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, this.exchangeRates);
			return;
		}

		this.exchangeRates = exchangeRatesNew.map((exchangeRate) => {
			const oldExchange = exchangeRatesOld.find((e) => e.casa === exchangeRate.casa);
			if (!oldExchange) return exchangeRate;
			if (oldExchange.fechaActualizacion === exchangeRate.fechaActualizacion) return oldExchange;

			return new ExchangeRate(
				exchangeRate.casa,
				exchangeRate.nombre,
				exchangeRate.compra,
				exchangeRate.venta,
				exchangeRate.fechaActualizacion,
				this.trendIcon(oldExchange.compra, exchangeRate.compra),
				this.trendIcon(oldExchange.venta, exchangeRate.venta)
			);
		});

		await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, this.exchangeRates);
	}

	private trendIcon(previous: number, current: number): string {
		if (previous < current) return 'arrow-trend-up';
		if (previous > current) return 'arrow-trend-down';
		return '';
	}
}
