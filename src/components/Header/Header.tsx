import React from "react";
import Button from "../Button/Button";
import logo from "../../assets/logo.png";
import logoInverter from "../../assets/logo-inverter.png";
import {useDarkMode} from "../../hooks/useDarkMode";

export default function Header() {
	const {darkMode, setDarkMode} = useDarkMode();
	const openSetting = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			var configTab = tabs.find(function (tab) {
				return tab.url.endsWith("options.html");
			});

			if (configTab) {
				chrome.tabs.reload(configTab.id);
			} else {
				chrome.tabs.create({url: "options.html"});
			}
		});
	};

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	return (
		<div className="flex items-center justify-between">
			<div>
				<img src={darkMode ? logoInverter : logo} className="w-20" />
			</div>
			<div className="flex items-center justify-between gap-2">
				<Button
					icon={darkMode ? "sun" : "moon"}
					size="sm"
					contentSize="lg"
					variant="text"
					color={darkMode ? "white" : "indigo"}
					tooltip={true}
					onClick={toggleDarkMode}
				/>
				<Button
					icon="gear"
					size="sm"
					contentSize="lg"
					variant="text"
					color={darkMode ? "white" : "indigo"}
					tooltip={true}
					onClick={openSetting}
				/>
			</div>
		</div>
	);
}
