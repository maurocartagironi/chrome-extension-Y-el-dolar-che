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
import { Alert, ThemeProvider, Typography } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

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
            {config ? (
               config.hasError ? (
                  <Alert 
                     color="red"
                     className="max-w-screen-md"
                     icon={<ExclamationTriangleIcon className="mt-px h-6 w-6" />}>
                     <Typography variant="h6" color="white">
                        {chrome.i18n.getMessage("error_general_title")}
                     </Typography>
                     <Typography color="white" className="mt-2 font-extralight text-sm">
                     {chrome.i18n.getMessage("error_general_description")}
                     </Typography>
                  </Alert> 
               ) : exchangeRates ? (
                  <>
                     <div>
                        <Header />
                        <Separator height="2" />
                        <ExchangeRateTable />
                        <Separator height="5" />
                        {!config.hideConversionSection ? (
                           <QuickPricing />
                        ) : (
                           <></>
                        )}
                     </div>
                     <Separator height="4" />
                     <Footer text={lastUpdated} />
                  </>
               ) : (
                  <MainLoader />
               )
            ) : (
               <MainLoader />
            )}
         </Container>
      </ThemeProvider>
   );
};

export default Popup;
