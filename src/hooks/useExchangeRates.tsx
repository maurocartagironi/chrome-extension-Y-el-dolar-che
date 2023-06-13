import { useEffect, useState } from "react";
import { LOCALSTORAGE_EXCHANGERATES } from "../static/default.config";
import { getLocalStorage } from "../utils/storage";

export function useExchangeRates() {
    const [exchangeRates, setExchangeRates] = useState(null);

    useEffect(() => {
      getLocalStorage(LOCALSTORAGE_EXCHANGERATES)
         .then((exchangeRates) => {
            if (exchangeRates) {
               setExchangeRates(exchangeRates);
            }
         })
      }, []);
     

     return exchangeRates;
}