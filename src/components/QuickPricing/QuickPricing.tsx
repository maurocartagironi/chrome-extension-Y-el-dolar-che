import React, {useState, useEffect} from "react";
import Title from "../../components/Title/Title";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import Button from "../../components/Button/Button";
import Result from "../Result/Result";
import Separator from "../Separator/Separator";
import {setLocalStorage} from "../../utils/storage";
import {LOCALSTORAGE_CONFIG} from "../../static/default.config";
import {useConfig} from "../../hooks/useConfig";
import {useExchangeRates} from "../../hooks/useExchangeRates";
import {formatCurrency} from "../../utils/general.utils";
import {Validator} from "../../utils/validator.utils";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function QuickPricing() {
	const {config} = useConfig();
	const exchangeRates = useExchangeRates();
	const [inputValue, setInputValue] = useState("");
	const [selectedValue, setSelectedValue] = useState("");
	const [result, setResult] = useState(["", ""]);
	const [listToConvert, setListToConvert] = useState([]);
	const [conversorType, setConversorType] = useState("ars");
	const [hasError, setHasError] = useState(false);
	const {darkMode} = useDarkMode();

	const handleSelectChange = (selectedValue: string) => {
		setSelectedValue(selectedValue);
	};

	const handleInputChange = (inputValue: string) => {
		setInputValue(inputValue);
	};

	const handleButtonClick = () => {
		setConversorType(conversorType === "usd" ? "ars" : "usd");
	};

	const setResults = () => {
		exchangeRates.map((item) => {
			if (item.id === selectedValue) {
				const buyResult =
					conversorType === "ars"
						? item.buy * Number.parseFloat(inputValue)
						: Number.parseFloat(inputValue) / item.buy;
				const sellResult =
					conversorType === "ars"
						? item.sell * Number.parseFloat(inputValue)
						: Number.parseFloat(inputValue) / item.sell;
				const buyFormatted = formatCurrency(buyResult.toString());
				const sellFormatted = formatCurrency(sellResult.toString());
				setResult([buyFormatted, sellFormatted]);
			}
		});
	};

	useEffect(() => {
		if (config) {
			setInputValue(config.conversorAmount ? config.conversorAmount : "");
			setSelectedValue(config.conversor);
			setConversorType(config.conversorType);
		}
	}, [config]);

	useEffect(() => {
		if (exchangeRates) {
			const updatedList = exchangeRates.map((item) => {
				return {
					value: item.id,
					label:
						conversorType === "ars"
							? chrome.i18n.getMessage(
									"item_usd_to_pesos",
									item.name
							  )
							: chrome.i18n.getMessage(
									"item_pesos_to_usd",
									item.name
							  ),
					isSelected: selectedValue === item.id,
				};
			});
			setListToConvert(updatedList);
		}
	}, [exchangeRates, conversorType, selectedValue]);

	useEffect(() => {
		if (config) {
			const validator = Validator.getInstance();
			setHasError(validator.hasError);
			if (
				(inputValue || inputValue === "") &&
				selectedValue &&
				!validator.hasError
			) {
				const updatedConfig = {
					...config,
					conversor: selectedValue,
					conversorAmount: inputValue,
					conversorType: conversorType,
				};
				setLocalStorage(LOCALSTORAGE_CONFIG, updatedConfig);
				if (inputValue) {
					setResults();
				} else {
					setResult(["", ""]);
				}
			} else {
				setResult(["", ""]);
			}
		}
	}, [inputValue, selectedValue, conversorType, config]);
	
	return (
		<>
			<Title text={chrome.i18n.getMessage("title_quick_pricing")} />
			<form>
				<div className="form-group flex gap-2">
					<Input
						value={inputValue}
						label={chrome.i18n.getMessage("placeholder_amount")}
						type="decimal"
						maxCharacters={9}
						maxLength={12}
						classList="w-80"
						onInputChange={handleInputChange}
					/>
					<Select
						label={chrome.i18n.getMessage(
							"placeholder_select_exchange_rate"
						)}
						id="conversor-select"
						list={listToConvert}
						onSelectChange={handleSelectChange}
					/>
					<div className="flex pt-1">
						{darkMode ? <Button
							icon="arrow-right-arrow-left"
							size="sm"
							variant="text"
							color="white"
							contentSize="lg"
							tooltip={true}
							onClick={handleButtonClick}
						/> : <Button
							icon="arrow-right-arrow-left"
							size="sm"
							variant="text"
							color="indigo"
							contentSize="lg"
							tooltip={true}
							onClick={handleButtonClick}
						/>}
					</div>
				</div>
			</form>
			{result[0] !== "" || result[1] !== "" ? (
				<div className="gap-2 flex items-center justify-between">
					<Result
						title={chrome.i18n.getMessage("result_buy")}
						icon="dollar-sign">
						{result[0]}
					</Result>
					<Result
						title={chrome.i18n.getMessage("result_sell")}
						icon="dollar-sign">
						{result[1]}
					</Result>
				</div>
			) : hasError ? (
				<></>
			) : (
				<>
					<Separator height="4" />
				</>
			)}
		</>
	);
}
