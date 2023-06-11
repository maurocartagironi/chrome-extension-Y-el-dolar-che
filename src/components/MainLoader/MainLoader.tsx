import React from "react";

export default function MainLoader() {
   return (
      <div className="p-4 flex-col flex justify-between">
         <div>
            <h5 className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-48 pb-10 mb-4"></h5>
            <h3 className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-48"></h3>

            <ul className="mt-5 space-y-3">
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            </ul>

            <h3 className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-48 mb-4 mt-8"></h3>
            <ul className="mt-5 space-y-3">
               <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            </ul>
         </div>
         <div>
            <h3 className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-48 mt-8"></h3>
         </div>
      </div>
   );
}
