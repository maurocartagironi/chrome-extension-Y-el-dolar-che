import React from "react";
import { Chip } from "@material-tailwind/react";

export default function Result({ children, title, icon }) {
   return children ? 
      (<div className="pt-2 w-full">
         <p className="text-green-800 font-bold">{title}</p>
         <Chip variant="ghost" color="green" className="text-center" size="lg" value={children} 
         icon={<div className="h-full p-1 flex items-center"><a className={`fas fa-${icon}`}></ a></div>} />
      </div>) : <div></div>;
}
