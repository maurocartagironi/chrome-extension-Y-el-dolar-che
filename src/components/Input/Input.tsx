import React, {useState, useEffect} from "react";
import {Input as TWInput} from "@material-tailwind/react";
import {Validator} from "../../utils/validator.utils";

interface InputProps {
	value?: any;
	label: string;
	type: string;
	maxCharacters?: number;
	maxLength?: number;
	classList?: string;
	onInputChange: (value: string) => void;
}

export default function Input({
	value = "",
	label,
	type,
	maxCharacters = 10,
	maxLength = 10,
	classList,
	onInputChange,
}: InputProps) {
	const [error, setError] = useState("");

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onInputChange(e.target.value);
	};

	const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		onInputChange(e.target.value);
	};

	useEffect(() => {
		const validator = Validator.getInstance();
		validator.validateInput(value, type, maxCharacters, maxLength);
		if (validator.hasError) {
			setError(validator.label);
		} else {
			setError("");
		}
	}, [value, type, maxCharacters, maxLength]);

	return (
		<>
			<div className={`input-min ${classList}`}>
				<TWInput
					type={type === "decimal" ? "text" : type}
					id="small-input"
					label={label}
					className="dark:text-white"
					value={value}
					error={error ? true : undefined}
					onChange={onChange}
					onBlur={onBlur}
				/>
				{error && (
					<p className="mt-1 text-xs text-red-600 dark:text-red-500 flex gap-1">
						{error}
					</p>
				)}
			</div>
		</>
	);
}
