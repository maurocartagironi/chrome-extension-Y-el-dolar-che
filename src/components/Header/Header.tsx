import React from "react";
import Button from "../Button/Button";
import logo from "../../assets/logo.png";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useConfig } from "../../hooks/useConfig";

export default function Header() {
   const { darkMode, setDarkMode } = useDarkMode();
   const config = useConfig();
   const openSetting = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         var configTab = tabs.find(function (tab) {
            return tab.url.endsWith("options.html");
         });

         if (configTab) {
            chrome.tabs.reload(configTab.id);
         } else {
            chrome.tabs.create({ url: "options.html" });
         }
      });
   };

   const switchDarkMode = () => {
      setDarkMode(!darkMode);
   };

   return (
      <div className="flex items-center justify-between">
         <div>
            <img src={logo} className="w-48" />
         </div>
         <div className="flex items-center justify-between">
            {/*<Button
               icon="moon"
               size="sm"
               contentSize="lg"
               variant="text"
               color="indigo"
               onClick={switchDarkMode}
   />*/}
            <Button
               icon="gear"
               size="sm"
               contentSize="lg"
               variant="text"
               color="indigo"
               onClick={openSetting}
            />
         </div>
      </div>
   );
}
