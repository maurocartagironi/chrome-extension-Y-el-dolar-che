import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';

import { LOCALSTORAGE_CONFIG, LOCALSTORAGE_EXCHANGERATES } from '@shared/constants/storage.constant';
import { BackgroundHelper } from '@shared/helpers/background.helper';
import { Config, ConfigOptions } from '@shared/models/Config';
import { RateHistory } from '@shared/models/DailyClose';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { HistoryService } from '@shared/services/history.service';
import { calculateTimeDifference, evaluateDarkMode, getLocalStorage } from '@shared/utils';
import { setLocalStorage } from '@shared/utils/storage.util';
import { ChromeService } from '@shared/utils/chrome.utils';
import { LegalTermsComponent } from 'src/app/components/legalterms/legalterms.component';
import { HeaderComponent } from '../../components/header/header.component';

import { TableComponent } from '../../components/table/table.component';
import { QuickPricingComponent } from '../../components/quick-pricing/quick-pricing.component';
import { SettingComponent } from '../../components/setting/setting.component';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	providers: [DolarAPIService, HistoryService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./popup.component.scss'],
	imports: [HeaderComponent, TableComponent, QuickPricingComponent, SettingComponent, LegalTermsComponent],
})
export class PopupComponent implements OnInit {
	dolarApiService = inject(DolarAPIService);
	historyService = inject(HistoryService);
	chromeService = inject(ChromeService);
	private changeDetector = inject(ChangeDetectorRef);

	@ViewChild('legalTerms') legalTerms!: LegalTermsComponent;

	public exchangeRates: ExchangeRate[] = [];
	/** Cierres diarios por casa: alimentan la variación del día y el sparkline. */
	public history: RateHistory = {};
	public lastUpdated: string = '';
	public realLastUpdated: Date = new Date();
	public config: Config = new Config();
	public loading: boolean = true;
	public hasError: boolean = false;
	public errorMessage: string = '';
	public isDarkMode: boolean = false;
	public activeIndex: number = 0;
	public tab: number | undefined;
	public currentTab = this.config.defaultTab;

	/**
	 * Índices de las tabs. Son fijos a propósito: cuando el de configuración
	 * se corría a 1 al ocultar el conversor, chocaba con el case del conversor
	 * en el @switch del template y ganaba el primero que matcheaba, así que la
	 * tab de configuración mostraba el conversor.
	 */
	readonly TAB_RATES = 0;
	readonly TAB_CONVERTER = 1;
	readonly TAB_SETTINGS = 2;

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
			this.config = new Config((await getLocalStorage<ConfigOptions>(LOCALSTORAGE_CONFIG)) ?? {});

			this.isDarkMode = evaluateDarkMode(this.config.darkMode);

			const oldExchangeRates = await getLocalStorage<ExchangeRate[]>(LOCALSTORAGE_EXCHANGERATES);
			const servicesExchangeRates = await this.dolarApiService.getAll(forceRefresh);

			await this.updateExchangeRates(oldExchangeRates, servicesExchangeRates);

			await this.backgroundHelper.setBadgeAndTooltip(this.exchangeRates);
			const lastUpdated = calculateTimeDifference(this.exchangeRates[0].fechaActualizacion);
			this.lastUpdated = this.chromeService.getMessage('footer', lastUpdated);
			this.realLastUpdated = new Date();
			this.loading = false;
			this.hasError = false;
			// `this.tab ?? ...` y no `!this.tab`: estando en Cotizaciones (0), un
			// refresh saltaba a la tab por defecto en vez de quedarse donde estaba.
			this.activeIndex = this.resolveTab(this.tab ?? this.config.defaultTab);
			// Con OnPush hay que marcar la vista: esto corre después de un await.
			this.changeDetector.markForCheck();
			// El histórico va aparte y sin await: son siete pedidos y la tabla no
			// tiene por qué esperarlos para mostrar los precios de hoy.
			void this.loadHistory();
		} catch (error: unknown) {
			// Un AbortError significa que ya salió un pedido más nuevo: ese actualiza la vista.
			if (error instanceof Error && error.name === 'AbortError') return;
			this.loading = false;
			this.hasError = true;
			this.errorMessage = error instanceof Error ? error.message : this.chromeService.getMessage('error_general_title');
			// Con OnPush hay que marcar la vista: esto corre después de un await.
			this.changeDetector.markForCheck();
		}
	}

	/**
	 * Los cierres diarios. Es información de apoyo: si falla, la tabla sigue
	 * mostrando los precios y los chips caen a la comparación entre sondeos.
	 */
	private async loadHistory(): Promise<void> {
		if (!this.exchangeRates.length) return;
		try {
			this.history = await this.historyService.getAll(this.exchangeRates.map((rate) => rate.casa));
			this.changeDetector.markForCheck();
		} catch {
			// sin histórico, la tabla se dibuja igual
		}
	}

	selectTab(index: number) {
		this.activeIndex = this.resolveTab(index);
		this.currentTab = this.activeIndex;
	}

	onTabChange(index: number) {
		this.currentTab = index;
	}

	refreshData(tab?: number, forceRefresh = false) {
		this.tab = tab;
		this.getData(forceRefresh);
		this.activeIndex = this.resolveTab(tab ?? this.TAB_RATES);
	}

	/** Si el conversor está oculto su tab no existe, así que se cae a Cotizaciones. */
	private resolveTab(index: number): number {
		if (index === this.TAB_CONVERTER && this.config.hiddenConversionSection) {
			return this.TAB_RATES;
		}
		return index;
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}

	async updateExchangeRates(exchangeRatesOld: ExchangeRate[] | undefined, exchangeRatesNew: ExchangeRate[]) {
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
				this.trendIcon(oldExchange.venta, exchangeRate.venta),
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
