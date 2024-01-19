import { useEffect, useState, useRef } from "react";
import { Config } from "../model/Config";
import { setLocalStorage, getLocalStorage } from "../utils/storage";
import { LOCALSTORAGE_CONFIG } from "../static/default.config";

export function useConfig() {
  const [config, setConfig] = useState<Config>();
  const configRef = useRef(config);

  useEffect(() => {
    setLocalStorage(LOCALSTORAGE_CONFIG, JSON.stringify(configRef.current));
  }, [configRef]);  

  useEffect(() => {
    getLocalStorage(LOCALSTORAGE_CONFIG).then((storedConfig) => {
      if (storedConfig) {
        configRef.current = JSON.parse(storedConfig);
        setConfig(JSON.parse(storedConfig));
      }
    });
  }, []);  

  return { config: configRef.current, setConfig };
}
