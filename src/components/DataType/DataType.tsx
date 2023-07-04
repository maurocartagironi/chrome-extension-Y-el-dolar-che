import * as React from "react";
import {formatCurrency} from "../../utils/general.utils";
import {Constant} from "../../constants/EnumConstants";

export default function DataType({type, color, icon, format, value}) {
	const setDataType = () => {
		switch (type) {
			case "currency":
				return formatCurrency(value);
			default:
				return value;
		}
	};

	return format === Constant.DATATYPE_COMPONENT_LABEL ? (
		<span
			className={
				`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ` +
				color
			}>
			{setDataType()} {icon ? <i className={`fas fa-${icon}`} /> : <></>}
		</span>
	) : (
		<span className={`font-semibold ` + color}>
			{setDataType()} {icon ? <i className={`fas fa-${icon}`} /> : <></>}
		</span>
	);
}
