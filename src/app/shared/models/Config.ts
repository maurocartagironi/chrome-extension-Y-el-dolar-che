import { DEFAULTS } from '@shared/constants/defaults.constant';

export interface ConfigOptions {
	badgeExchangeRateType?: string;
	badgeExchangeRateAction?: string;
	tooltipExchangeRateType?: string;
	currencyConversor?: string;
	alarmPeriodInMinutes?: number;
	badgeBackgroundColor?: string;
	hiddenConversionSection?: boolean;
	darkMode?: string;
	valueConversor?: number;
	defaultTab?: number;
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
	public defaultTab: number;
	public darkMode: string;

	constructor(opts: ConfigOptions = {}) {
		this.badgeExchangeRateType = opts.badgeExchangeRateType ?? DEFAULTS.badgeExchangeRateType;
		this.badgeExchangeRateAction = opts.badgeExchangeRateAction ?? DEFAULTS.badgeExchangeRateAction;
		this.tooltipExchangeRateType = opts.tooltipExchangeRateType ?? DEFAULTS.tooltipExchangeRateType;
		this.currencyConversor = opts.currencyConversor ?? DEFAULTS.currencyConversor;
		this.alarmPeriodInMinutes = opts.alarmPeriodInMinutes ?? DEFAULTS.alarmPeriodInMinutes;
		this.valueConversor = opts.valueConversor ?? DEFAULTS.valueConversor;
		this.badgeBackgroundColor = opts.badgeBackgroundColor ?? DEFAULTS.badgeBackgroundColor;
		this.hiddenConversionSection = opts.hiddenConversionSection ?? DEFAULTS.hiddenConversionSection;
		this.darkMode = opts.darkMode ?? DEFAULTS.darkMode;
		this.defaultTab = opts.defaultTab ?? DEFAULTS.defaultTab;
	}
}
