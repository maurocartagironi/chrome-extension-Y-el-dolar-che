import { LOCALSTORAGE_ALERT_FIRED, LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config, ConfigOptions } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { calculateTimeDifference, formatCurrency } from '@shared/utils/general.utils';
import { getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';

export const ALARM_NAME = 'dolar-refresh';

/**
 * Lógica que corre en el service worker. A propósito sin `@Injectable`:
 * ese decorador arrastra todo @angular/core al bundle del background.
 */
export class BackgroundHelper {
	public badgeExchangeRate: ExchangeRate | undefined;
	public tooltipExchangeRate: ExchangeRate | undefined;
	public config: Config = new Config();
	public dolarApiService: DolarAPIService = new DolarAPIService();
	public exchangeRateList: ExchangeRate[] = [];

	public async init(): Promise<void> {
		await this.loadConfig();

		const existing = await chrome.alarms.get(ALARM_NAME);
		if (!existing) {
			await chrome.alarms.create(ALARM_NAME, {
				periodInMinutes: this.config.alarmPeriodInMinutes,
			});
		}

		await this.refreshData();
	}

	/** Desde la alarma o el arranque del browser: siempre pide datos nuevos. */
	public async refreshData(): Promise<void> {
		await this.loadConfig();
		this.exchangeRateList = await this.dolarApiService.getAll(true, this.config.showOtherCurrencies);
		await this.setBadgeAndTooltip();
		await this.checkAlert();
	}

	public async setBadgeAndTooltip(exchangeRates?: ExchangeRate[]): Promise<void> {
		if (exchangeRates?.length) {
			this.exchangeRateList = exchangeRates;
		}

		await this.loadConfig();

		this.badgeExchangeRate =
			this.exchangeRateList.find((value) => value.casa === this.config.badgeExchangeRateType) ?? this.exchangeRateList[0];
		this.tooltipExchangeRate =
			this.exchangeRateList.find((value) => value.casa === this.config.tooltipExchangeRateType) ?? this.exchangeRateList[0];

		if (!this.badgeExchangeRate || !this.tooltipExchangeRate) return;

		const badgeValue = this.config.badgeExchangeRateAction === 'sell' ? this.badgeExchangeRate.venta : this.badgeExchangeRate.compra;

		// El badge muestra ~4 caracteres: redondear evita que se corte en "1480.5".
		await chrome.action.setBadgeText({ text: Math.round(badgeValue).toString() });
		await chrome.action.setBadgeBackgroundColor({ color: this.config.badgeBackgroundColor });
		await chrome.action.setTitle({ title: this.generateTooltip() });
	}

	/**
	 * Avisa cuando el precio de venta cruza el valor que puso el usuario.
	 *
	 * Solo notifica en el cruce: mientras la condición se siga cumpliendo no
	 * vuelve a avisar, porque si no mandaría una notificación cada diez minutos
	 * hasta que el precio se diera vuelta.
	 */
	public async checkAlert(): Promise<void> {
		if (!this.config.alertEnabled || this.config.alertValue <= 0) return;

		const rate = this.exchangeRateList.find((value) => value.casa === this.config.alertExchangeRateType);
		if (!rate) return;

		const cumple = this.config.alertDirection === 'below' ? rate.venta <= this.config.alertValue : rate.venta >= this.config.alertValue;
		const yaAvisado = (await getLocalStorage<boolean>(LOCALSTORAGE_ALERT_FIRED)) ?? false;

		if (cumple && !yaAvisado) {
			await this.notifyAlert(rate);
		}

		if (cumple !== yaAvisado) {
			await setLocalStorage(LOCALSTORAGE_ALERT_FIRED, cumple);
		}
	}

	private async notifyAlert(rate: ExchangeRate): Promise<void> {
		const clave = this.config.alertDirection === 'below' ? 'alert_message_below' : 'alert_message_above';

		await chrome.notifications.create(`${ALARM_NAME}-${Date.now()}`, {
			type: 'basic',
			iconUrl: 'assets/img/icon.png',
			title: chrome.i18n.getMessage('alert_title'),
			message: chrome.i18n.getMessage(clave, [rate.nombre, formatCurrency(rate.venta), formatCurrency(this.config.alertValue)]),
		});
	}

	/** Muestra el error en el tooltip del icono, sin tocar la config guardada. */
	public async showError(error: unknown): Promise<void> {
		const message = error instanceof Error ? error.message : String(error);
		await chrome.action.setBadgeText({ text: '!' });
		await chrome.action.setTitle({ title: message });
	}

	private async loadConfig(): Promise<void> {
		const saved = await getLocalStorage<ConfigOptions>(LOCALSTORAGE_CONFIG);
		// Rehidratar con el constructor rellena los campos que una versión previa no guardó.
		this.config = new Config(saved ?? {});
		if (!saved) {
			await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		}
	}

	private generateTooltip(): string {
		if (!this.tooltipExchangeRate) return '';
		const sinceDate = calculateTimeDifference(this.tooltipExchangeRate.fechaActualizacion);
		return chrome.i18n.getMessage('tooltip', [
			this.tooltipExchangeRate.nombre,
			formatCurrency(this.tooltipExchangeRate.compra),
			formatCurrency(this.tooltipExchangeRate.venta),
			sinceDate,
		]);
	}
}
