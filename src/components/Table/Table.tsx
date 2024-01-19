import * as React from "react";
import Cell from "../Cell/Cell";
import {Column} from "../../model/Column";

export default function Table({rows, columns}) {
	return (
		<div className="overflow-hidden rounded-lg border dark:border-gray-800 shadow-md">
			<table className="w-full border-collapse text-left text-xs dark:border-gray-800">
				<thead className="text-black dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800">
					<tr className="dark:border-gray-800">
						{columns.map((col: Column) => (
							<th
								key={col.id}
								scope="col"
								className="px-3 py-2 dark:border-gray-800">
								{col.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y border-t dark:border-gray-800 bg-white dark:bg-gray-900 divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-50">
					{rows.map((row: any) => (
						<tr key={Math.random()}>
							{columns.map((col: Column, i: number) => (
								<Cell
									key={col.id + row.id}
									row={row}
									col={col}
									pos={i}
								/>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
