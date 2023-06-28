import {ExclamationTriangleIcon} from "@heroicons/react/24/solid";
import {Alert, Typography} from "@material-tailwind/react";
import {refresh} from "../../background/background.core";
import Button from "../../components/Button/Button";

import React from "react";

export default function Error() {
	return (
		<div className="bg-red-500 rounded-md">
			<Alert
				color="red"
				className="max-w-screen-md"
				icon={<ExclamationTriangleIcon className="mt-px h-6 w-6" />}>
				<Typography variant="h6" color="white">
					{chrome.i18n.getMessage("error_general_title")}
				</Typography>
				<Typography
					color="white"
					className="mt-2 font-extralight text-sm">
					{chrome.i18n.getMessage("error_general_description")}
				</Typography>
			</Alert>
			<div className="flex justify-end p-4 pt-0">
				<Button
					icon="refresh"
					size="sm"
					contentSize="lg"
					variant="text"
					color="white"
					onClick={() => refresh()}
				/>
			</div>
		</div>
	);
}
