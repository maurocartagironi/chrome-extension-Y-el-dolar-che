import { environment } from 'src/environments/environment';

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
		this.badgeExchangeRateType = opts.badgeExchangeRateType ?? environment.defaultBadgeExchangeRateType;
		this.badgeExchangeRateAction = opts.badgeExchangeRateAction ?? environment.defaultBadgeExchangeRateAction;
		this.tooltipExchangeRateType = opts.tooltipExchangeRateType ?? environment.defaultTooltipExchangeRateType;
		this.currencyConversor = opts.currencyConversor ?? environment.defaultCurrencyConversor;
		this.alarmPeriodInMinutes = opts.alarmPeriodInMinutes ?? environment.defaultAlarmPeriodInMinutes;
		this.valueConversor = opts.valueConversor ?? environment.defaultValueConversor;
		this.badgeBackgroundColor = opts.badgeBackgroundColor ?? environment.defaultBadgeBackgroundColor;
		this.hiddenConversionSection = opts.hiddenConversionSection ?? environment.defaultHiddenConversionSection;
		this.darkMode = opts.darkMode ?? environment.defaultDarkMode;
		this.defaultTab = opts.defaultTab ?? environment.defaultTab;
	}
}
