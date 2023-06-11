import React, { useEffect, useState } from "react";
import "./options.css";
import Container from "../../components/Container/Container";
import Button from "../../components/Button/Button";
import Separator from "../../components/Separator/Separator";
import { Alert, Switch } from "@material-tailwind/react";
import Select from "../../components/Select/Select";
import { useExchangeRates } from "../../hooks/useExchangeRates";
import { useConfig } from "../../hooks/useConfig";
import ItemOption from "../../components/ItemOption/ItemOption";
import OptionGroup from "../../components/OptionGroup/OptionGroup";
import { setLocalStorage } from "../../utils/storage";
import { LOCALSTORAGE_CONFIG } from "../../static/default.config";
import {
   calculateTimeDifference,
   formatCurrency,
} from "../../utils/general.utils";
import { tooltip } from "../../static/labels.config";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const Options = () => {
   const exchangeRates = useExchangeRates();
   const config = useConfig();

   const [badgeExchangeRateslist, setBadgeExchangeRatesList] = useState([]);
   const [tooltipExchangeRateslist, setTooltipExchangeRatesList] = useState([]);
   const [sellBuyList, setSellBuyList] = useState([]);

   const [badgeExchangeRate, setBadgeExchangeRate] = useState();
   const [badgeExchangeRateType, setBadgeExchangeRateType] = useState();
   const [badgeColor, setBadgeColor] = useState(undefined);
   const [tooltipExchangeRate, setTooltipExchangeRate] = useState();
   const [hideConversionSection, setHideConversionSection] = useState(false);
   const [localConfig, setLocalConfig] = useState(null);
   const [isSaved, setIsSaved] = useState(false);

   const closeOptions = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         var currentTab = tabs[0];
         chrome.tabs.remove(currentTab.id);
         window.close();
      });
   };
   const saveOptions = () => {
      setLocalStorage(LOCALSTORAGE_CONFIG, localConfig);
      let message = {
         badge: "",
         tooltip: "",
         color: "",
      };
      if (exchangeRates) {
         exchangeRates.map((item: any, i: number) => {
            if (localConfig.exchangeRateToShowInBadge === item?.id) {
               message.badge =
                  item[localConfig.exchangeRateTypeToShowInBadge].toString();
               message.color = localConfig.badgeColor;
            }
            if (item.id === localConfig.exchangeRateToShowInTooltip) {
               const sinceDate = calculateTimeDifference(item.lastUpdated);
               const tooltipString: string = tooltip
                  .replace("{0}", item.name)
                  .replace("{1}", formatCurrency(item.buy).toString())
                  .replace("{2}", formatCurrency(item.sell).toString())
                  .replace("{3}", sinceDate);
               message.tooltip = tooltipString;
            }
         });
      }
      setIsSaved(true);
      chrome.runtime.sendMessage({ message: message });

      setTimeout(() => {
         window.location.reload();
      }, 2400);
   };

   const onSelectExchangeRateChange = (value) => {
      setBadgeExchangeRate(value);
   };
   const onSelectSellBuyChange = (value) => {
      setBadgeExchangeRateType(value);
   };
   const onSelectExchangeRateTooltip = (value) => {
      setTooltipExchangeRate(value);
   };
   const onSelectColorChange = (e) => {
      setBadgeColor(e.target.value);
   };
   const onSwitchChange = (e) => {
      setHideConversionSection(e.target.checked);
   };
   const validateConfig = (configParam) => {
      return configParam
         ? !(
              config.exchangeRateToShowInBadge ===
                 configParam.exchangeRateToShowInBadge &&
              config.exchangeRateTypeToShowInBadge ===
                 configParam.exchangeRateTypeToShowInBadge &&
              config.exchangeRateToShowInTooltip ===
                 configParam.exchangeRateToShowInTooltip &&
              config.badgeColor === configParam.badgeColor &&
              configParam.hideConversionSection === config.hideConversionSection
           )
         : false;
   };

   useEffect(() => {
      if (config && exchangeRates) {
         setBadgeExchangeRatesList(
            exchangeRates.map((item) => {
               return {
                  value: item.id,
                  label: item.name,
                  isSelected: config.exchangeRateToShowInBadge === item.id,
               };
            })
         );
         setTooltipExchangeRatesList(
            exchangeRates.map((item) => {
               return {
                  value: item.id,
                  label: item.name,
                  isSelected: config.exchangeRateToShowInTooltip === item.id,
               };
            })
         );
         setSellBuyList([
            {
               value: "buy",
               label: "Compra",
               isSelected: config.exchangeRateTypeToShowInBadge === "buy",
            },
            {
               value: "sell",
               label: "Venta",
               isSelected: config.exchangeRateTypeToShowInBadge === "sell",
            },
         ]);
         setBadgeColor(config.badgeColor);
         setHideConversionSection(config.hideConversionSection);
      }
   }, [config, exchangeRates]);

   useEffect(() => {
      if (config) {
         const aux = {
            conversorAmount: config.conversorAmount,
            conversor: config.conversor,
            conversorType: config.conversorType,
            exchangeRateToShowInBadge: badgeExchangeRate
               ? badgeExchangeRate
               : config.exchangeRateToShowInBadge,
            exchangeRateTypeToShowInBadge: badgeExchangeRateType
               ? badgeExchangeRateType
               : config.exchangeRateTypeToShowInBadge,
            exchangeRateToShowInTooltip: tooltipExchangeRate
               ? tooltipExchangeRate
               : config.exchangeRateToShowInTooltip,
            badgeColor: badgeColor ? badgeColor : config.badgeColor,
            hideConversionSection:
               hideConversionSection !== undefined
                  ? hideConversionSection
                  : config.hideConversionSection,
            isChanged: false,
         };
         aux.isChanged = validateConfig(aux);
         setLocalConfig(aux);
      }
   }, [
      badgeExchangeRate,
      badgeExchangeRateType,
      tooltipExchangeRate,
      badgeColor,
      hideConversionSection,
   ]);

   return (
      <div className="bg-blue-gray-50 dark:bg-blue-gray-900">
         {isSaved ? (
            <Alert
               icon={<CheckCircleIcon className="mt-px h-6 w-6" />}
               color="green"
               className="fixed z-20 top-16 w-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
               Los cambios se han guardado correctamente...
            </Alert>
         ) : (
            <></>
         )}
         <div className="bg-blue-gray-900 dark:bg-gray-400 fixed w-full h-16 z-10 top-0">
            <div className="w-2/5 mx-auto flex flex-row justify-between">
               <div className="p-4 text-3xl text-white dark:text-gray-400">
                  Opciones
               </div>
               <div className="flex flex-row p-4 gap-2">
                  <div>
                     <Button
                        text="Cancelar"
                        size="sm"
                        color="white"
                        variant="text"
                        onClick={closeOptions}
                     />
                  </div>
                  <div>
                     <Button
                        text="Guardar"
                        disabled={localConfig && !localConfig.isChanged}
                        size="sm"
                        color="indigo"
                        variant="filled"
                        onClick={saveOptions}
                     />
                  </div>
               </div>
            </div>
         </div>
         <div className="w-2/5 h-screen mx-auto mt-16 ">
            <div className="flex-col flex">
               <Container>
                  <Separator height="4" />
                  <div className="gap-2 flex flex-col">
                     <OptionGroup label="Badge">
                        <ItemOption
                           label="Tipo de cambio"
                           description="Permite ver en el icono de la extensión el precio actualizado del tipo de cambio que elijas.">
                           {badgeExchangeRateslist ? (
                              <Select
                                 label="Tipos de cambio"
                                 id="selectExchangeRateSelect"
                                 list={badgeExchangeRateslist}
                                 onSelectChange={onSelectExchangeRateChange}
                              />
                           ) : (
                              <></>
                           )}
                        </ItemOption>
                        <ItemOption
                           label="Compra o Venta"
                           description="Se puede cambiar entre mostrar en el icono de la extensión el tipo de cambio de compra o de venta segun elección.">
                           {sellBuyList ? (
                              <Select
                                 label="Compra o Venta"
                                 id="BuySellSelect"
                                 list={sellBuyList}
                                 onSelectChange={onSelectSellBuyChange}
                              />
                           ) : (
                              <></>
                           )}
                        </ItemOption>
                        <ItemOption 
                           label="Color del badge"
                           description="Permite seleccionar el color de fondo del badge.">
                           <div>
                              <input
                                 className="cursor-pointer outline-0 outline border border-blue-gray-200 bg-transparent rounded-md p-1 min-w-[200px] h-10"
                                 type="color"
                                 value={badgeColor}
                                 id="badge-color"
                                 title="Elije un color"
                                 onChange={onSelectColorChange}
                              />
                           </div>
                        </ItemOption>
                     </OptionGroup>
                     <OptionGroup label="Tooltip">
                        <ItemOption
                           label="Tipo de cambio"
                           description="Al mantener el mouse en el icono de la extensión, se abre un elemento que permite ver el precio del tipo de cambio seleccionado, tanto el de compra como el de venta y su ultima actualización.">
                           {tooltipExchangeRateslist ? (
                              <Select
                                 label="Tipos de cambio"
                                 id="selectExchangeRateSelect2"
                                 list={tooltipExchangeRateslist}
                                 onSelectChange={onSelectExchangeRateTooltip}
                              />
                           ) : (
                              <></>
                           )}
                        </ItemOption>
                     </OptionGroup>
                     <OptionGroup label="Conversor">
                        <ItemOption
                           label="Ocultar conversor"
                           description="Es posible ocultar o mostrar el conversor.">
                           <div className="min-w-[200px]">
                              <Switch
                                 id="switch"
                                 color="indigo"
                                 checked={
                                    hideConversionSection ? true : undefined
                                 }
                                 nonce={undefined}
                                 onResize={undefined}
                                 onResizeCapture={undefined}
                                 onChange={onSwitchChange}
                              />
                           </div>
                        </ItemOption>
                     </OptionGroup>
                  </div>
               </Container>
            </div>
         </div>
      </div>
   );
};

export default Options;
