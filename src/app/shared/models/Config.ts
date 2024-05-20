import { environment } from "src/environments/environment";

export class Config {
    public badgeExchangeRateType: string;
    public badgeExchangeRateAction: string;
	public tooltipExchangeRateType: string;
    public currencyConversor: string;
	public exchangeRateConversor: string = "";
	public valueConversor: number | undefined = 0;
    public alarmPeriodInMinutes: number;
    public badgeBackgroundColor: string;
    public hiddenConversionSection: boolean;
    public darkMode: boolean;
    public hasError: boolean;

    constructor(badgeExchangeRateType?: string, badgeExchangeRateAction?: string, tooltipExchangeRateType?: string, currencyConversor?: string, alarmPeriodInMinutes?: number, badgeBackgroundColor?: string, hiddenConversionSection?: boolean, darkMode?: boolean, hasError?: boolean) {
        this.badgeExchangeRateType = badgeExchangeRateType || environment.defaultBadgeExchangeRateType;
        this.badgeExchangeRateAction = badgeExchangeRateAction || environment.defaultBadgeExchangeRateAction;
		this.tooltipExchangeRateType = tooltipExchangeRateType || environment.defaultTooltipExchangeRateType;
        this.currencyConversor = currencyConversor || environment.defaultCurrencyConversor;
        this.alarmPeriodInMinutes = alarmPeriodInMinutes || environment.defaultAlarmPeriodInMinutes;
		this.badgeBackgroundColor = badgeBackgroundColor ||	environment.defaultBadgeBackgroundColor;
        this.hiddenConversionSection = hiddenConversionSection || environment.defaultHiddenConversionSection;
        this.darkMode = darkMode || environment.defaultDarkMode;
        this.hasError = hasError || false; 
    }
}
