import React, {useEffect} from "react";
import {SelectItem} from "../../model/SelectItem";
import {Select as TWSelect, Option} from "@material-tailwind/react";

export default function Select({label, id, list, onSelectChange}) {
	const selectedValue = list.find(
		(item: SelectItem) => item.isSelected
	)?.value;
	const selectedValueLabel = list.find(
		(item: SelectItem) => item.isSelected
	)?.label;
	const element = document.getElementById(id);
	const handleSelectChange = (value: string) => {
		onSelectChange(value);
	};

	useEffect(() => {
		if (element != null && element instanceof Element) {
			const childElement = element.childNodes[0];
			if (childElement instanceof Element) {
				setTimeout(() => {
					childElement.innerHTML = selectedValueLabel;
				});
			}
		}
	}, [selectedValueLabel]);

	return (
		<div>
			<TWSelect
				value={selectedValue}
				onChange={handleSelectChange}
				id={id}
				label={label}
				className="text-sm font-medium">
				{list.map((item: SelectItem) => (
					<Option
						className="text-sm font-medium"
						value={item.value}
						key={item.value}>
						{item.label}
					</Option>
				))}
			</TWSelect>
		</div>
	);
}
