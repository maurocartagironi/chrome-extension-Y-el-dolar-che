import * as React from "react";
import {IconButton} from "@material-tailwind/react";
import {Tooltip} from "@material-tailwind/react";
import {Button as MTWButton} from "@material-tailwind/react";
import {useConfig} from "../../hooks/useConfig";
import {useState} from "react";

interface ButtonProps {
	icon?: string;
	text?: string;
	variant?: any;
	size?: any;
	color?: any;
	disabled?: any;
	contentSize?: string;
	className?: string;
	tooltip?: boolean;
	onClick?: (e) => void;
}

export default function Button({
	icon,
	text,
	variant,
	size,
	color,
	disabled,
	contentSize,
	className,
	tooltip,
	onClick,
}: ButtonProps) {
	const {config} = useConfig();
	const [darkMode, setDarkMode] = useState(config && config.darkMode);
	const handleClick = (e) => {
		e.preventDefault();
		if (onClick) onClick(e);
	};

	return text ? (
		<MTWButton
			disabled={disabled ? true : undefined}
			onClick={handleClick}
			className={`cursor-pointer ${className}`}
			variant={variant}
			color={color}
			size={size}>
			{text}
		</MTWButton>
	) : tooltip ? (
		<Tooltip
			content={chrome.i18n.getMessage("label_" + icon.replace(/-/g, "_"))}
			placement="bottom"
			className={
				darkMode ? "bg-white text-black" : "bg-black text-white"
			}>
			<IconButton
				className="cursor-pointer"
				onClick={handleClick}
				variant={variant}
				color={color}
				size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}>
				<i
					className={`fas fa-${icon} ${
						contentSize === "lg"
							? "fa-lg"
							: contentSize === "md"
							? "fa-md"
							: ""
					}`}
				/>
			</IconButton>
		</Tooltip>
	) : (
		<IconButton
			className="cursor-pointer"
			onClick={handleClick}
			variant={variant}
			color={color}
			size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}>
			<i
				className={`fas fa-${icon} ${
					contentSize === "lg"
						? "fa-lg"
						: contentSize === "md"
						? "fa-md"
						: ""
				}`}
			/>
		</IconButton>
	);
}
