import * as React from "react";
import DataType from "../DataType/DataType";

export default function Cell({ row, col, pos }) {
   return row[col.id].label ? pos === 0 ? (
      <th className="px-3 py-2" key={col.id}>
         <DataType
            type={col.datatype}
            color={row[col.id].color}
            icon={row[col.id].icon}
            format={col.format}
            value={row[col.id].label}
         />
      </th> 
   ) : (
      <td className="px-3 py-2" key={col.id}>
         <DataType
            type={col.datatype}
            color={row[col.id].color}
            icon={row[col.id].icon}
            format={col.format}
            value={row[col.id].label}
         />
      </td>
   ) : <td className="px-3 py-2 text-white dark:text-bg-slate-800" key={col.id}>-</td>;
}
