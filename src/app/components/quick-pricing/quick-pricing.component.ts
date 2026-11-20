import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config, ConfigOptions } from '@shared/models/Config';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';

import { ResultComponent } from '../result/result.component';

interface CurrencyOption {
	label: string;
	value: string;
}

@Component({
	selector: 'app-quick-pricing',
	imports: [FormsModule, ResultComponent],
	templateUrl: './quick-pricing.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './quick-pricing.component.scss',
})
export class QuickPricingComponent implements OnInit {
	private changeDetector = inject(ChangeDetectorRef);
	private chromeService = inject(ChromeService);

	@Input() exchangeRateList: ExchangeRate[] = [];
	public picklistCurrency: CurrencyOption[] = [];
	public result: Map<string, string | undefined> = new Map<string, string>();
	public config: Config = new Config();
	public currencyConversor: CurrencyOption | undefined;
	/** Lo que se ve en el input: el monto ya formateado en es-AR. */
	public amountText = '';

	private readonly integerFormatter = new Intl.NumberFormat('es-AR');
	private readonly currencyFormatter = new Intl.NumberFormat('es-AR', {
		style: 'currency',
		minimumFractionDigits: 2,
		currency: 'ARS',
	});

	ngOnInit() {
		this.initialize();
	}

	private async initialize() {
		this.config = new Config((await getLocalStorage<ConfigOptions>(LOCALSTORAGE_CONFIG)) ?? {});
		this.picklistCurrency = this.exchangeRateList
			.flatMap((e) => [
				{ label: this.chromeService.getMessage('conversor_option_to_pesos', e.nombre), value: e.casa + '-ars' },
				{ label: this.chromeService.getMessage('conversor_option_from_pesos', e.nombre), value: 'ars-' + e.casa },
			])
			.sort((a, b) => a.label.localeCompare(b.label));
		this.currencyConversor = this.picklistCurrency.find((e) => e.value === this.config.currencyConversor);
		this.amountText = this.renderAmount(this.config.valueConversor);
		this.setResult();
	}

	/**
	 * Deja tipear dígitos y una coma decimal, agrupa los miles en vivo y
	 * mantiene el valor numérico en la config.
	 */
	async onAmountInput(raw: string): Promise<void> {
		const cleaned = raw.replace(/[^\d,]/g, '');
		const [integerPart = '', ...rest] = cleaned.split(',');
		const hasComma = cleaned.includes(',');
		const decimals = rest.join('').slice(0, 2);

		const integerDigits = integerPart.replace(/^0+(?=\d)/, '');
		const integerValue = integerDigits ? Number(integerDigits) : 0;
		const grouped = integerDigits ? this.integerFormatter.format(integerValue) : '';

		if (!grouped && !hasComma) {
			this.amountText = '';
			this.config.valueConversor = 0;
		} else {
			this.amountText = `$ ${grouped || '0'}${hasComma ? `,${decimals}` : ''}`;
			this.config.valueConversor = Number(`${integerValue}.${decimals || 0}`);
		}

		await this.onChange();
	}

	private renderAmount(value: number): string {
		if (!Number.isFinite(value) || value === 0) return '';
		const decimals = Number.isInteger(value) ? 0 : 2;
		return `$ ${new Intl.NumberFormat('es-AR', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: 2,
		}).format(value)}`;
	}

	async onChange() {
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	async onSelectChange(option: CurrencyOption | undefined) {
		if (!option) return;
		this.currencyConversor = option;
		this.config.currencyConversor = option.value;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	async onCurrencyToggle() {
		const currencies = this.currencyConversor?.value.split('-');
		if (currencies) {
			const newValue = `${currencies[1]}-${currencies[0]}`;
			this.currencyConversor = this.picklistCurrency.find((e) => e.value === newValue);
		}
		if (this.currencyConversor) {
			this.config.currencyConversor = this.currencyConversor.value;
		}
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.setResult();
	}

	setResult() {
		const currencies = this.currencyConversor?.value.split('-');
		let currencyKey: string | undefined;
		if (currencies) {
			currencyKey = currencies[0] === 'ars' ? currencies[1] : currencies[0];
		}
		const rate = this.exchangeRateList.find((e) => e.casa === currencyKey);

		if (rate && currencies && this.config.valueConversor) {
			const v = this.config.valueConversor;
			const fromArs = currencies[0] === 'ars';
			this.result.set('compra', this.currencyFormatter.format(fromArs ? v / rate.compra : v * rate.compra));
			this.result.set('venta', this.currencyFormatter.format(fromArs ? v / rate.venta : v * rate.venta));
		} else {
			this.result.set('compra', undefined);
			this.result.set('venta', undefined);
		}

		// Con OnPush hay que marcar la vista: setResult() corre después de un await.
		this.changeDetector.markForCheck();
	}

	showTitleResult() {
		const currencies = this.currencyConversor?.value.split('-');
		const nombre = (casa: string | undefined) => this.exchangeRateList.find((e) => e.casa === casa)?.nombre.toLowerCase() ?? '';
		if (currencies?.[0] === 'ars') {
			return this.chromeService.getMessage('conversor_result_from_pesos', nombre(currencies[1]));
		}
		return this.chromeService.getMessage('conversor_result_to_pesos', nombre(currencies?.[0]));
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
