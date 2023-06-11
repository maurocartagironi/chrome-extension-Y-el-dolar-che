export class Config {
   exchangeRateToShowInBadge: string;
   exchangeRateTypeToShowInBadge: string;
   exchangeRateToShowInTooltip: string;
   conversor: string;
   conversorType: string;
   conversorAmount: string;
   alarmPeriodInMinutes: number;
   badgeColor: string;
   hideConversionSection: boolean;
   darkMode: boolean;

   constructor(
      exchangeRateToShowInBadge: string,
      exchangeRateTypeToShowInBadge: string,
      exchangeRateToShowInTooltip: string,
      conversor: string,
      conversorType: string,
      conversorAmount: string,
      alarmPeriodInMinutes: number,
      badgeColor: string,
      hideConversionSection: boolean,
      darkMode: boolean
   ) {
      this.exchangeRateToShowInBadge = exchangeRateToShowInBadge;
      this.exchangeRateTypeToShowInBadge = exchangeRateTypeToShowInBadge;
      this.exchangeRateToShowInTooltip = exchangeRateToShowInTooltip;
      this.conversor = conversor;
      this.conversorType =conversorType;
      this.conversorAmount = conversorAmount;
      this.alarmPeriodInMinutes = alarmPeriodInMinutes;
      this.badgeColor = badgeColor;
      this.hideConversionSection = hideConversionSection;
      this.darkMode = darkMode;
   }

   public getConversorAmount() {
      return this.conversorAmount;
   }
}
