import { DEFAULTS } from '@shared/constants/defaults.constant';

export interface ConfigOptions {
	badgeExchangeRateType?: string;
	badgeExchangeRateAction?: string;
	tooltipExchangeRateType?: string;
	currencyConversor?: string;
	alarmPeriodInMinutes?: number;
	badgeBackgroundColor?: string;
	hiddenConversionSection?: boolean;
	showOtherCurrencies?: boolean;
	darkMode?: string;
	valueConversor?: number;
	defaultTab?: number;
	alertEnabled?: boolean;
	alertExchangeRateType?: string;
	alertDirection?: string;
	alertValue?: number;
}

export class Config {
	public badgeExchangeRateType: string;
	public badgeExchangeRateAction: string;
	public tooltipExchangeRateType: string;
	public currencyConversor: string;
	public valueConversor: number;
	public alarmPeriodInMinutes: number;
	public badgeBackgroundColor: string;
	public hiddenConversionSection: boolean;
	public showOtherCurrencies: boolean;
	public defaultTab: number;
	public darkMode: string;
	public alertEnabled: boolean;
	public alertExchangeRateType: string;
	public alertDirection: string;
	public alertValue: number;

	constructor(opts: ConfigOptions = {}) {
		this.badgeExchangeRateType = opts.badgeExchangeRateType ?? DEFAULTS.badgeExchangeRateType;
		this.badgeExchangeRateAction = opts.badgeExchangeRateAction ?? DEFAULTS.badgeExchangeRateAction;
		this.tooltipExchangeRateType = opts.tooltipExchangeRateType ?? DEFAULTS.tooltipExchangeRateType;
		this.currencyConversor = opts.currencyConversor ?? DEFAULTS.currencyConversor;
		this.alarmPeriodInMinutes = opts.alarmPeriodInMinutes ?? DEFAULTS.alarmPeriodInMinutes;
		this.valueConversor = opts.valueConversor ?? DEFAULTS.valueConversor;
		this.badgeBackgroundColor = opts.badgeBackgroundColor ?? DEFAULTS.badgeBackgroundColor;
		this.hiddenConversionSection = opts.hiddenConversionSection ?? DEFAULTS.hiddenConversionSection;
		this.showOtherCurrencies = opts.showOtherCurrencies ?? DEFAULTS.showOtherCurrencies;
		this.darkMode = opts.darkMode ?? DEFAULTS.darkMode;
		this.defaultTab = opts.defaultTab ?? DEFAULTS.defaultTab;
		this.alertEnabled = opts.alertEnabled ?? DEFAULTS.alertEnabled;
		this.alertExchangeRateType = opts.alertExchangeRateType ?? DEFAULTS.alertExchangeRateType;
		this.alertDirection = opts.alertDirection ?? DEFAULTS.alertDirection;
		this.alertValue = opts.alertValue ?? DEFAULTS.alertValue;
	}
}
