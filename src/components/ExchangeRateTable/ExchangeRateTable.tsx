import React, {useEffect, useState} from "react";
import Table from "../../components/Table/Table";
import {Icon} from "../../constants/EnumIcons";
import {Constant} from "../../constants/EnumConstants";
import {Column} from "../../model/Column";
import {Row} from "../../model/Row";
import {WrapperExchangeRate} from "../../model/WrapperExchangeRate";
import {ExchangeRate} from "../../model/ExchangeRate";
import Title from "../../components/Title/Title";
import {useExchangeRates} from "../../hooks/useExchangeRates";
import Separator from "../Separator/Separator";

export default function ExchangeRateTable() {
	const exchangeRates = useExchangeRates();
	const [columns, setColumns] = useState(null);
	const [wrapperExchangeRates, setWrapperExchangeRates] = useState(null);

	useEffect(() => {
		if (exchangeRates) {
			const generateWrapperExchangeRates = () => {
				let wrapperExchangeRates = [];
				exchangeRates.forEach((element: ExchangeRate) => {
					wrapperExchangeRates.push(
						new WrapperExchangeRate(
							new Row(
								element.name,
								undefined,
								setColor(undefined, false)
							),
							new Row(
								element.buy,
								setIcon(element.isPositiveBuyProyection),
								setColor(element.isPositiveBuyProyection, true)
							),
							new Row(
								element.sell,
								setIcon(element.isPositiveSellProyection),
								setColor(element.isPositiveSellProyection, true)
							)
						)
					);
				});

				setWrapperExchangeRates(wrapperExchangeRates);
			};

			const generateColumns = () => {
				setColumns([
					new Column(
						"name",
						chrome.i18n.getMessage("table_thead_col_exchange"),
						Constant.DATATYPE_TEXT,
						Constant.DATATYPE_COMPONENT_TEXT
					),
					new Column(
						"buy",
						chrome.i18n.getMessage("table_thead_col_buy"),
						Constant.DATATYPE_CURRENCY,
						Constant.DATATYPE_COMPONENT_LABEL
					),
					new Column(
						"sell",
						chrome.i18n.getMessage("table_thead_col_sell"),
						Constant.DATATYPE_CURRENCY,
						Constant.DATATYPE_COMPONENT_LABEL
					),
				]);
			};

			generateWrapperExchangeRates();
			generateColumns();
		}
	}, [exchangeRates]);

	const setIcon = (isPositive: boolean) => {
		if (isPositive === null || isPositive === undefined) {
			return Icon.LINE;
		} else if (isPositive) {
			return Icon.ARROW_UP;
		} else {
			return Icon.ARROW_DOWN;
		}
	};

	const setColor = (isPositive: boolean, isLabel: boolean) => {
		if (isPositive === undefined || isPositive === null) {
			return isLabel
				? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-50"
				: "text-gray-600 dark:text-gray-50";
		} else if (isPositive) {
			return isLabel
				? "bg-green-50 dark:bg-green-800 text-green-600 dark:text-green-50"
				: "text-green-600 dark:text-green-50";
		} else {
			return isLabel
				? "bg-red-50 dark:bg-red-800 text-red-600 dark:text-red-50"
				: "text-red-600 dark:text-red-50";
		}
	};

	return (
		<div>
			<Separator height="2" />
			{wrapperExchangeRates ? (
				<Table rows={wrapperExchangeRates} columns={columns} />
			) : (
				<></>
			)}
		</div>
	);
}
