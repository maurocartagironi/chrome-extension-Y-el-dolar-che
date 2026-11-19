/**
 * Valores por defecto de la configuración.
 *
 * Viven acá y no en `environments/`: ahí estaban duplicados en dos archivos
 * idénticos salvo una línea, y esa duplicación fue justamente la que dejó
 * `production: false` en el build publicado. En `environments/` quedó solo
 * ese flag.
 */
export const DEFAULTS = {
	/** "blue" | "oficial" | "bolsa" | "contadoconliqui" | "mayorista" | "cripto" | "tarjeta" */
	badgeExchangeRateType: 'blue',
	/** "buy" | "sell" */
	badgeExchangeRateAction: 'buy',
	tooltipExchangeRateType: 'blue',
	currencyConversor: 'blue-ars',
	alarmPeriodInMinutes: 10,
	badgeBackgroundColor: '#4A4A4A',
	hiddenConversionSection: false,
	/** "auto" | "dark" | "light" */
	darkMode: 'auto',
	defaultTab: 0,
	valueConversor: 0,
} as const;
