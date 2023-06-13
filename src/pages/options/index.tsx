import React from "react";
import { createRoot } from "react-dom/client";
import "../../assets/tailwind.css";
import Options from "./options";

function init() {
   const appContainer = document.createElement("div");
   document.body.appendChild(appContainer);
   document.title = `${chrome.i18n.getMessage("title_option")} ${chrome.i18n.getMessage("appName")}`;
   if (!appContainer) {
      throw new Error("Can not find AppContainer");
   }
   const root = createRoot(appContainer);
   root.render(<Options />);
}

init();
