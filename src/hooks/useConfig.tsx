import { useEffect, useState } from "react";
import { Config } from "../model/Config";
import { getLocalStorage } from "../utils/storage";
import { LOCALSTORAGE_CONFIG } from "../static/default.config";

export function useConfig() {
   const [config, setConfig] = useState<Config>();

   useEffect(() => {
      getLocalStorage(LOCALSTORAGE_CONFIG).then((storedConfig) => {
         if (storedConfig) {
            setConfig(storedConfig);
         }
      });
   }, []);

   return config;
}
