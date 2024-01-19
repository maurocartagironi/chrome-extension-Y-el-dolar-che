import {Typography} from "@material-tailwind/react";
import React from "react";
import Separator from "../Separator/Separator";

export default function ItemOption({label, children}) {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl p-4 border-[#D8E2EB] dark:border-gray-800 border text-gray-800 dark:text-gray-50">
			<Typography
				variant="h6"
				className="border-b border-[#D8E2EB] dark:border-gray-800">
				{label}
			</Typography>
			<Separator height="6" />
			<div className="flex flex-col justify-between gap-4">
				{children}
			</div>
		</div>
	);
}
