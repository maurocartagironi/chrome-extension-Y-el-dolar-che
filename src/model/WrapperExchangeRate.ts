import { Row } from "./Row";
import { Wrapper } from "./Wrapper";

export class WrapperExchangeRate implements Wrapper {
   name: Row;
   buy: Row;
   sell: Row;

   constructor(name: Row, buy: Row, sell: Row) {
      this.name = name;
      this.buy = buy;
      this.sell = sell;
   }
}
