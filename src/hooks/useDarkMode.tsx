import { useEffect, useState } from "react";
import { useConfig } from "./useConfig";
import { setLocalStorage } from "../utils/storage";
import { LOCALSTORAGE_CONFIG } from "../static/default.config";

export function useDarkMode() {
   const [darkMode, setDarkMode] = useState(null);
   const config = useConfig();

   useEffect(() => {
      if (config) {
         const element = document.getElementsByTagName("html")[0];
         if (darkMode) {
            element.classList.add("dark");
         } else {
            element.classList.remove("dark");
         }

         config.darkMode = darkMode;
         setLocalStorage(LOCALSTORAGE_CONFIG, config);
      }
   }, [darkMode]);

   return { darkMode, setDarkMode };
}
