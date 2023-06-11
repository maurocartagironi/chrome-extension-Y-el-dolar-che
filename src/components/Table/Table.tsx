import * as React from "react";
import Cell from "../Cell/Cell";
import { Column } from "../../model/Column";

export default function Table({ rows, columns }) {
   return (
      <div className="overflow-hidden rounded-lg border shadow-md">
         <table className="w-full border-collapse text-left text-xs">
            <thead className="text-black dark:text-white bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-slate-60">
               <tr>
                  {columns.map((col: Column) => (
                     <th key={col.id}
                        scope="col"
                        className="px-3 py-2">
                        {col.label}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y border-t bg-white dark:bg-slate-800 divide-gray-100 dark:divide-slate-600 text-gray-600 dark:text-gray-50">
               {rows.map((row: any) => (
                  <tr key={Math.random()}>
                     {columns.map((col: Column, i: number) => (
                        <Cell key={col.id + row.id} row={row} col={col} pos={i} />
                     ))}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
