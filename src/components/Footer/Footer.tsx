import {Typography} from "@material-tailwind/react";
import * as React from "react";
import manifest from "../../static/manifest.json";

export default function Footer({text}) {
	return (
		<>
			<div className="pl-2 rounded-md border-2 text-center flex text-white dark:border-gray-800 bg-indigo-600">
				<div className="flex-wrap flex content-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="w-4 h-4">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<div
					className="p-2 items-center leading-none lg:rounded-full flex lg:inline-flex"
					role="alert">
					<span className="font-semibold mr-2 text-left flex-auto">
						{text}
					</span>
				</div>
			</div>
			<div className="pt-4">
				<hr className="hr-legal" />
				<div className="legal-bg">
					<Typography className="legal text-justify text-gray-500 dark:text-gray-700">
						<span className="legal font-bold text-gray-500 dark:text-gray-700">
							{chrome.i18n.getMessage("label_gavel")}:&nbsp;
						</span>
						{chrome.i18n.getMessage("label_gavel_description")}
						<br />
						<span className="version">
							{chrome.i18n.getMessage("appName")} - v
							{manifest.version}
						</span>
					</Typography>
				</div>
			</div>
		</>
	);
}
