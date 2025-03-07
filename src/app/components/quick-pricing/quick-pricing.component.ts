import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';

import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ResultComponent } from '../result/result.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
	selector: 'app-quick-pricing',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		InputNumberModule,
		FloatLabelModule,
		DropdownModule,
		ButtonModule,
		ResultComponent,
		NgSelectModule,
	],
	templateUrl: './quick-pricing.component.html',
	styleUrl: './quick-pricing.component.scss',
})
export class QuickPricingComponent {
	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: any[] = [];
	public result: Map<string, string | undefined> = new Map<string, string>();
	public config: Config = new Config();
	public exchangeSelected: ExchangeRate = new ExchangeRate();
	public currencyConversor: any;
	public error: string = '';

	constructor() {}

	async ngOnInit() {
		this.config = (await getLocalStorage(LOCALSTORAGE_CONFIG)) as Config;
		this.exchangeRateList.map((e) => {
			this.picklistCurrency.push({
				label: e.nombre + ' a pesos',
				value: e.casa + '-ars',
			});
			this.picklistCurrency.push({
				label: 'Pesos a ' + e.nombre,
				value: 'ars-' + e.casa,
			});
		});
		this.picklistCurrency.sort((a, b) => a.label.localeCompare(b.label));
		this.currencyConversor = this.picklistCurrency.find((e) => e.value === this.config.currencyConversor);
		this.setResult();
	}

	async onChange(event: any) {
		if (event.target.value === '$ 0,00') {
			event.target.value = '';
		}
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
			const newValue = currencies[1] + '-' + currencies[0];
			this.currencyConversor = this.picklistCurrency.find((e) => e.value === newValue);
		}
		this.config.currencyConversor = this.currencyConversor.value;
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
		let currencyConversor = undefined;
		if (currencies) {
			currencyConversor = currencies[0];
			if (currencies[0] === 'ars') {
				currencyConversor = currencies[1];
			}
		}
		const currentExchangeRate: ExchangeRate = this.exchangeRateList.find((e) => e.casa === currencyConversor) as ExchangeRate;
		if (currentExchangeRate) {
			const valueConversor = this.config.valueConversor;
			if (valueConversor && currencies) {
				if (currencies[0] === 'ars') {
					this.result.set('compra', formatter.format(valueConversor / currentExchangeRate.compra));
					this.result.set('venta', formatter.format(valueConversor / currentExchangeRate.venta));
				} else {
					this.result.set('compra', formatter.format(valueConversor * currentExchangeRate.compra));
					this.result.set('venta', formatter.format(valueConversor * currentExchangeRate.venta));
				}
			} else {
				this.result.set('compra', undefined);
				this.result.set('venta', undefined);
			}
		}
	}

	showTitleResult() {
		const currencies = this.currencyConversor?.value.split('-');
		if (currencies && currencies[0] === 'ars') {
			return 'Pesos argentinos a ' + this.exchangeRateList.find((e) => e.casa === currencies[1])?.nombre.toLowerCase() + ': ';
		}

		return this.exchangeRateList.find((e) => e.casa === currencies[0])?.nombre.toLowerCase() + ' a pesos argentinos: ';
	}
}
