import { LOCALSTORAGE_ALERT_FIRED, LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config, ConfigOptions } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { DolarAPIService } from '@shared/services/dolar-api.service';
import { parseAmount } from '@shared/utils/amount.util';
import { calculateTimeDifference, formatCurrency } from '@shared/utils/general.utils';
import { getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';

export const ALARM_NAME = 'dolar-refresh';

/** Ítems del menú del click derecho sobre una selección. */
export const MENU_TO_ARS = 'convertir-a-pesos';
export const MENU_FROM_ARS = 'convertir-desde-pesos';

/** Fuera de pesos, el resultado se muestra sin símbolo para no mentir la moneda. */
const plainFormatter = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

		await this.setupContextMenus();
		await this.refreshData();
	}

	/**
	 * Los dos ítems del click derecho. Se rearman en cada init porque el título
	 * sale de los mensajes y puede cambiar de idioma.
	 */
	public async setupContextMenus(): Promise<void> {
		await chrome.contextMenus.removeAll();

		chrome.contextMenus.create({
			id: MENU_TO_ARS,
			title: chrome.i18n.getMessage('context_menu_to_ars'),
			contexts: ['selection'],
		});
		chrome.contextMenus.create({
			id: MENU_FROM_ARS,
			title: chrome.i18n.getMessage('context_menu_from_ars'),
			contexts: ['selection'],
		});
	}

	/**
	 * Convierte lo que el usuario haya seleccionado en la página y muestra el
	 * resultado en una notificación. Usa el tipo de cambio del indicador.
	 */
	public async convertSelection(menuItemId: string, selectionText: string): Promise<void> {
		if (menuItemId !== MENU_TO_ARS && menuItemId !== MENU_FROM_ARS) return;

		await this.loadConfig();

		const amount = parseAmount(selectionText);
		if (amount === null) {
			await this.notify(chrome.i18n.getMessage('context_error', selectionText.trim().slice(0, 40)));
			return;
		}

		if (!this.exchangeRateList.length) {
			this.exchangeRateList = await this.dolarApiService.getAll(false, this.config.showOtherCurrencies);
		}

		const rate = this.exchangeRateList.find((value) => value.casa === this.config.badgeExchangeRateType) ?? this.exchangeRateList[0];
		if (!rate) return;

		const haciaPesos = menuItemId === MENU_TO_ARS;
		const compra = haciaPesos ? amount * rate.compra : amount / rate.compra;
		const venta = haciaPesos ? amount * rate.venta : amount / rate.venta;
		const formatear = (value: number) => (haciaPesos ? formatCurrency(value) : plainFormatter.format(value));

		await this.notify(
			chrome.i18n.getMessage('context_result', [plainFormatter.format(amount), formatear(compra), formatear(venta)]),
			rate.nombre,
		);
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

		await this.notify(chrome.i18n.getMessage(clave, [rate.nombre, formatCurrency(rate.venta), formatCurrency(this.config.alertValue)]));
	}

	private async notify(message: string, title?: string): Promise<void> {
		await chrome.notifications.create(`${ALARM_NAME}-${Date.now()}`, {
			type: 'basic',
			iconUrl: 'assets/img/icon-128.png',
			title: title ?? chrome.i18n.getMessage('alert_title'),
			message,
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
