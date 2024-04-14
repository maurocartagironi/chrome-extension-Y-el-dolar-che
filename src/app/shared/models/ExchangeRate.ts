export class ExchangeRate {
	id: string;
	name: string;
	buy: string;
	sell: string;
	lastUpdated: Date;

	constructor(
		id?: string,
		name?: string,
		buy?: string,
		sell?: string,
		lastUpdated?: Date
	) {
		this.id = id || "";
		this.name = (id === "blue" ? chrome.i18n.getMessage("blue") : name) || "";
		this.buy = buy || "";
		this.sell = sell || "";
		this.lastUpdated = lastUpdated || new Date();
	}
}
