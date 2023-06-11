import { useEffect, useState } from "react";
import { LOCALSTORAGE_DATE } from "../static/default.config";
import { getLocalStorage } from "../utils/storage";

export function useLastUpdated() {
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
      getLocalStorage(LOCALSTORAGE_DATE)
         .then((lastUpdated) => {
            if (lastUpdated) {
               setLastUpdated(lastUpdated);
            }
         })
      }, []);

     return lastUpdated;
}