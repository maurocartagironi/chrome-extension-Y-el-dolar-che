import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';

@Component({
  selector: 'app-quick-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,],
  templateUrl: './quick-pricing.component.html',
  styleUrl: './quick-pricing.component.scss'
})
export class QuickPricingComponent {
	@Input() exchangeRateList: ExchangeRate[] = [];	
	public result: Map<string, number> = new Map<string, number>();
	public config: Config = new Config();
	public exchangeSelected: ExchangeRate = new ExchangeRate();

	constructor() {}

	async ngOnInit() {
		this.config = await getLocalStorage(LOCALSTORAGE_CONFIG) as Config;
		this.setResult();
	}

	async onChange(event: any) {
		this.config.valueConversor = event.target.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	async onSelectChange(event: any) {
		this.config.currencyConversor = event.target.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}
	setResult() {
		const currentExchangeRate: ExchangeRate = this.exchangeRateList.find(e => e.casa === this.config.currencyConversor) as ExchangeRate;
		if(currentExchangeRate) {
			this.result.set('compra', this.config.valueConversor * currentExchangeRate.compra);
			this.result.set('venta', this.config.valueConversor * currentExchangeRate.venta);
		}
	}
}
