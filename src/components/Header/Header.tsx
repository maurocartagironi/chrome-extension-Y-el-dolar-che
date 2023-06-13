import React from "react";
import Button from "../Button/Button";
import logo from "../../assets/logo.png";

export default function Header() {
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

   const clearSessionStorage = () => {
      chrome.storage.local.clear();
   };

   return (
      <div className="flex items-center justify-between">
         <div>
            <img src={logo} className="w-20" />
         </div>
         <div className="flex items-center justify-between gap-2">
            <Button
               icon="trash"
               size="sm"
               contentSize="lg"
               variant="text"
               color="indigo"
               onClick={clearSessionStorage}
            />
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
