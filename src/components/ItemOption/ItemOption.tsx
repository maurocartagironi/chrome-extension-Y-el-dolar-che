import {Tooltip, Typography} from "@material-tailwind/react";
import React from "react";
import {InformationCircleIcon} from "@heroicons/react/24/outline";

export default function ItemOption({label, description, children}) {
	return (
		<div className="flex items-center justify-between">
			<div className="text-sm text-center flex-row gap-1 flex items-center">
				{label}
				<Tooltip
					content={
						<div className="w-80">
							<Typography
								variant="small"
								color="white"
								className="text-xs">
								{description}
							</Typography>
						</div>
					}>
					<InformationCircleIcon
						strokeWidth={2}
						className="text-blue-gray-500 w-4 h-4 cursor-pointer"
					/>
				</Tooltip>
			</div>
			{children}
		</div>
	);
}
