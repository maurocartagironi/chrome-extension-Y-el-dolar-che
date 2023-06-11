import { ENDPOINT } from "../static/default.config";

const DolarAPI = {
   getAll: async (): Promise<[]> => {
      const response = await fetch(ENDPOINT);
      const data = await response.json();

      return data;
   },
};

export default DolarAPI;
