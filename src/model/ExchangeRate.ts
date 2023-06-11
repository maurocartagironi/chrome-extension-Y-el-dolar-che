export class ExchangeRate {
   id: string;
   name: string;
   buy: string;
   sell: string;
   showInTooltip: boolean;
   showInBadge: boolean;
   lastUpdated: Date;
   isPositiveBuyProyection: boolean;
   isPositiveSellProyection: boolean;

   constructor(
      id: string,
      name: string,
      buy: string,
      sell: string,
      showInTooltip: boolean,
      showInBadge: boolean,
      lastUpdated: Date,
      oldExchangeRate: ExchangeRate
   ) {
      this.id = id;
      this.name = name;
      this.buy = buy;
      this.sell = sell;
      this.showInTooltip = showInTooltip;
      this.showInBadge = showInBadge;
      this.lastUpdated = lastUpdated;
      this.isPositiveBuyProyection =
         oldExchangeRate.buy < this.buy
            ? true
            : oldExchangeRate.buy > this.buy
            ? false
            : oldExchangeRate.isPositiveBuyProyection;
      this.isPositiveSellProyection =
         oldExchangeRate.sell < this.sell
            ? true
            : oldExchangeRate.sell > this.sell
            ? false
            : oldExchangeRate.isPositiveSellProyection;
   }
}
