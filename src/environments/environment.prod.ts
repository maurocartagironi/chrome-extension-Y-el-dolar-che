// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
  defaultBadgeExchangeRateType: "blue", // "blue" | "oficial" | "bolsa" | "contadoconliqui" | "mayorista" | "cripto" | "tarjeta"
  defaultBadgeExchangeRateAction: "buy", // "buy" | "sell"
  defaultTooltipExchangeRateType: "blue", // "blue" | "oficial" | "bolsa" | "contadoconliqui" | "mayorista" | "cripto" | "tarjeta"
  defaultCurrencyConversor: "blue-ars", // "blue" | "oficial" | "bolsa" | "contadoconliqui" | "mayorista" | "cripto" | "tarjeta"
  defaultAlarmPeriodInMinutes: 10,
  defaultBadgeBackgroundColor: "#4A4A4A",
  defaultHiddenConversionSection: false,
  defaultDarkMode: false,
  defaultTab: 0,
  defaultValueConversor: 0
};

/*
* For easier debugging in development mode, you can import the following file
* to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
*
* This import should be commented out in production mode because it will have a negative impact
* on performance if an error is thrown.
*/
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
