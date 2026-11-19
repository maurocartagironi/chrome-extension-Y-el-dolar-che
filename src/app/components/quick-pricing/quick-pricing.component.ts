import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';

import { InputNumberModule } from 'primeng/inputnumber';
import { ResultComponent } from '../result/result.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
	selector: 'app-quick-pricing',
	standalone: true,
	imports: [CommonModule, FormsModule, InputNumberModule, ResultComponent, NgSelectModule],
	templateUrl: './quick-pricing.component.html',
	styleUrl: './quick-pricing.component.scss',
})
export class QuickPricingComponent implements OnInit {
	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: any[] = [];
	public result: Map<string, string | undefined> = new Map<string, string>();
	public config: Config = new Config();
	public currencyConversor: any;

	ngOnInit() {
		this.initialize();
	}

	private async initialize() {
		this.config = (await getLocalStorage(LOCALSTORAGE_CONFIG)) as Config;
		this.picklistCurrency = this.exchangeRateList.flatMap((e) => [
			{ label: e.nombre + ' a pesos', value: e.casa + '-ars' },
			{ label: 'Pesos a ' + e.nombre, value: 'ars-' + e.casa },
		]).sort((a, b) => a.label.localeCompare(b.label));
		this.currencyConversor = this.picklistCurrency.find((e) => e.value === this.config.currencyConversor);
		this.setResult();
	}

	async onChange() {
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	async onSelectChange(event: any) {
		this.config.currencyConversor = event.value;
		this.currencyConversor = event;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	async onCurrencyToggle() {
		const currencies = this.currencyConversor?.value.split('-');
		if (currencies) {
			const newValue = `${currencies[1]}-${currencies[0]}`;
			this.currencyConversor = this.picklistCurrency.find((e) => e.value === newValue);
		}
		this.config.currencyConversor = this.currencyConversor?.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	setResult() {
		const formatter = new Intl.NumberFormat('es-AR', {
			style: 'currency',
			minimumFractionDigits: 2,
			currency: 'ARS',
		});

		const currencies = this.currencyConversor?.value.split('-');
		let currencyKey: string | undefined;
		if (currencies) {
			currencyKey = currencies[0] === 'ars' ? currencies[1] : currencies[0];
		}
		const rate = this.exchangeRateList.find((e) => e.casa === currencyKey);

		if (rate && currencies && this.config.valueConversor) {
			const v = this.config.valueConversor;
			const fromArs = currencies[0] === 'ars';
			this.result.set('compra', formatter.format(fromArs ? v / rate.compra : v * rate.compra));
			this.result.set('venta',  formatter.format(fromArs ? v / rate.venta  : v * rate.venta));
		} else {
			this.result.set('compra', undefined);
			this.result.set('venta',  undefined);
		}
	}

	showTitleResult() {
		const currencies = this.currencyConversor?.value.split('-');
		if (currencies?.[0] === 'ars') {
			return 'Pesos argentinos a ' + (this.exchangeRateList.find((e) => e.casa === currencies[1])?.nombre.toLowerCase() ?? '') + ':';
		}
		return (this.exchangeRateList.find((e) => e.casa === currencies?.[0])?.nombre.toLowerCase() ?? '') + ' a pesos argentinos:';
	}
}
