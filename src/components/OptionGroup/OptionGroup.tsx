import { Typography } from "@material-tailwind/react";
import React from "react";
import Separator from "../Separator/Separator";

export default function ItemOption({ label, children }) {
   return (
      <div className="bg-white dark:bg-blue-gray-900 rounded-xl p-4 border-blue-gray-200 border text-gray-800">
         <Typography variant="h5" className="border-b-2 border-gray-800">
            {label}
         </Typography>
         <Separator height="6" />
         <div className="flex flex-col justify-between gap-4">
            {children}
         </div>
      </div>
   );
}
