import { ENDPOINT } from "../static/default.config";

const DolarAPI = {
   getAll: async (): Promise<[]> => {
      try {
         const response = await fetch(ENDPOINT);
         if (!response.ok) {
            throw new Error();
         }
         const data = await response.json();
         return data;
      } catch (error) {
         console.error("Error en la solicitud: ", error);
         throw new Error();
      }
   },
};

export default DolarAPI;
