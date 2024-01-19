import { useEffect, useState } from "react";
import { useConfig } from "./useConfig";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(null);
  const [config, setConfig] = useState(useConfig());

  useEffect(() => {
    if (config) {
      const body = document.body;
      if (darkMode) {
        body.classList.add("dark");
      } else {
        body.classList.remove("dark");
      }

      // Crea una copia del objeto config y actualiza el valor de darkMode en la copia.
      const updatedConfig = { ...config, darkMode: darkMode };
      setConfig(updatedConfig);
    }
  }, [darkMode]);

  return { darkMode, setDarkMode, config };
}
