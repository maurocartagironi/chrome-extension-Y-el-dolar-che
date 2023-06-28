import DolarAPI from "../utils/api.rest";
import {
	DEFAULT_ALARM_PERIOD_IN_MINUTES,
	DEFAULT_BADGE_EXCHANGE_RATE,
	DEFAULT_TOOLTIP_EXCHANGE_RATE,
	LOCALSTORAGE_EXCHANGERATES,
	LOCALSTORAGE_CONFIG,
	LOCALSTORAGE_DATE,
	DEFAULT_BADGE_EXCHANGE_RATE_TYPE,
	DEFAULT_BADGE_COLOR,
	DEFAULT_CONVERSOR,
	DEFAULT_DARK_MODE,
	DEFAULT_HIDE_CONVERSION_SECTION,
	DEFAULT_CONVERSOR_TYPE,
} from "../static/default.config";
import {getLocalStorage, setLocalStorage} from "../utils/storage";
import {formatCurrency, calculateTimeDifference} from "../utils/general.utils";
import {ExchangeRate} from "../model/ExchangeRate";
import {Config} from "../model/Config";

export const init = async (): Promise<void> => {
	try {
		chrome.alarms.create({
			periodInMinutes: DEFAULT_ALARM_PERIOD_IN_MINUTES,
		});
		await setData();
	} catch (e) {
		const config = await setConfig();
		console.log(e);
		config.hasError = true;
		setLocalStorage(LOCALSTORAGE_CONFIG, config);
	}
};

export const refresh = async (): Promise<void> => {
	try {
		await setData();
	} catch (e) {
		const config = await setConfig();
		config.hasError = true;
		console.log(e);
		setLocalStorage(LOCALSTORAGE_CONFIG, config);
	}
};

const setData = async (): Promise<void> => {
	const response = await DolarAPI.getAll();
	const config = await setConfig();
	const oldExchangeRate = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);

	let lastUpdated: string;
	let exchangeRates: ExchangeRate[] = [];
	response.map((item: any, i: number) => {
		const exchangeRate = new ExchangeRate(
			item.casa,
			item.nombre,
			item.compra,
			item.venta,
			item.casa === DEFAULT_TOOLTIP_EXCHANGE_RATE,
			item.casa === DEFAULT_BADGE_EXCHANGE_RATE,
			item.fechaActualizacion,
			oldExchangeRate ? oldExchangeRate[i] : {}
		);
		setBadge(
			exchangeRate,
			config.exchangeRateToShowInBadge,
			config.exchangeRateTypeToShowInBadge,
			config.badgeColor
		);
		setTooltip(exchangeRate, config.exchangeRateToShowInTooltip);
		exchangeRates.push(exchangeRate);
		lastUpdated = calculateTimeDifference(exchangeRate.lastUpdated);
	});

	await setLocalStorage(
		LOCALSTORAGE_DATE,
		chrome.i18n.getMessage("footer", lastUpdated)
	);
	await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, exchangeRates);
	await setLocalStorage(LOCALSTORAGE_CONFIG, config);
};

const setTooltip = async (
	exchangeRate: ExchangeRate,
	defaultExchangeRate: string
): Promise<void> => {
	if (exchangeRate.id === defaultExchangeRate) {
		const title = await generateTooltip(exchangeRate);
		chrome.action.setTitle({title});
	}
};

const setBadge = (
	exchangeRate: ExchangeRate,
	defaultBadge: string,
	defaultBadgeType: string,
	defaultBadgeColor: string
): void => {
	if (exchangeRate?.buy && defaultBadge === exchangeRate?.id) {
		chrome.action.setBadgeText({
			text: exchangeRate[defaultBadgeType].toString(),
		});
		chrome.action.setBadgeBackgroundColor({color: defaultBadgeColor});
	}
};

const generateTooltip = async (exchangeRate: ExchangeRate): Promise<string> => {
	const sinceDate = calculateTimeDifference(exchangeRate.lastUpdated);
	return chrome.i18n.getMessage("tooltip", [
		exchangeRate.name,
		formatCurrency(exchangeRate.buy).toString(),
		formatCurrency(exchangeRate.sell).toString(),
		sinceDate,
	]);
};

const setConfig = async (): Promise<Config> => {
	const localConfig: Config = await getLocalStorage(LOCALSTORAGE_CONFIG);
	return localConfig
		? new Config(
				localConfig.exchangeRateToShowInBadge ??
					DEFAULT_BADGE_EXCHANGE_RATE,
				localConfig.exchangeRateTypeToShowInBadge ??
					DEFAULT_BADGE_EXCHANGE_RATE_TYPE,
				localConfig.exchangeRateToShowInTooltip ??
					DEFAULT_TOOLTIP_EXCHANGE_RATE,
				localConfig.conversor ?? DEFAULT_CONVERSOR,
				localConfig.conversorType ?? DEFAULT_CONVERSOR_TYPE,
				localConfig.conversorAmount ?? null,
				localConfig.alarmPeriodInMinutes ??
					DEFAULT_ALARM_PERIOD_IN_MINUTES,
				localConfig.badgeColor ?? DEFAULT_BADGE_COLOR,
				localConfig.hideConversionSection ??
					DEFAULT_HIDE_CONVERSION_SECTION,
				localConfig.darkMode ?? DEFAULT_DARK_MODE
		  )
		: new Config(
				DEFAULT_BADGE_EXCHANGE_RATE,
				DEFAULT_BADGE_EXCHANGE_RATE_TYPE,
				DEFAULT_TOOLTIP_EXCHANGE_RATE,
				DEFAULT_CONVERSOR,
				DEFAULT_CONVERSOR_TYPE,
				null,
				DEFAULT_ALARM_PERIOD_IN_MINUTES,
				DEFAULT_BADGE_COLOR,
				DEFAULT_HIDE_CONVERSION_SECTION,
				DEFAULT_DARK_MODE
		  );
};
