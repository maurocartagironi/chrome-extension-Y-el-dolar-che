import React from "react";

// CSS
import "./popup.css";

// Model
import { ExchangeRate } from "../../model/ExchangeRate";
import { Config } from "../../model/Config";

// Hooks
import { useExchangeRates } from "../../hooks/useExchangeRates";
import { useLastUpdated } from "../../hooks/useLastUpdated";
import { useConfig } from "../../hooks/useConfig";

// Components
import ExchangeRateTable from "../../components/ExchangeRateTable/ExchangeRateTable";
import Footer from "../../components/Footer/Footer";
import MainLoader from "../../components/MainLoader/MainLoader";
import Header from "../../components/Header/Header";
import QuickPricing from "../../components/QuickPricing/QuickPricing";
import Separator from "../../components/Separator/Separator";
import Container from "../../components/Container/Container";

// Material tailwind
import { ThemeProvider } from "@material-tailwind/react";

const Popup = () => {
   const exchangeRates: ExchangeRate[] = useExchangeRates();
   const lastUpdated: string = useLastUpdated();
   const config: Config = useConfig();
   
   return (
      <ThemeProvider>
         <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
         />
         <Container>
            {exchangeRates && config ? (
               <>
                  <div>
                     <Header />
                     <Separator height="2" />
                     <ExchangeRateTable />
                     <Separator height="5" />
                     {!config.hideConversionSection ? <QuickPricing /> : <></>}
                  </div>
                  <Separator height="4" />                  
                  <Footer text={lastUpdated} />
               </>
            ) : (
               <MainLoader />
            )}
         </Container>
      </ThemeProvider>
   );
};

export default Popup;
