import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [TableModule, CommonModule, TagModule],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit, OnChanges {
	@Input() exchangeRates: ExchangeRate[] = [];
	public exchangeRatesUpdated: any[] = [];

	ngOnInit(): void {
		this.exchangeRatesUpdated = this.exchangeRates;
	}

	ngOnChanges(): void {
		this.exchangeRatesUpdated = this.exchangeRates;
	}

	stringToNumber(text: string | undefined) {
		let cleanedStr = text?.replace(/[^0-9,]/g, '');
		cleanedStr = cleanedStr?.replace(',', '.');
		let number = cleanedStr ? parseFloat(cleanedStr) : 0;
		let formattedNumber = number.toLocaleString('es-ES', {
			useGrouping: false,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		return formattedNumber;
	}

	toCurrencyPesos(value: number) {
		const formatter = new Intl.NumberFormat('es-AR', {
			style: 'currency',
			minimumFractionDigits: 2,
			currency: 'ARS',
		});
		return formatter.format(value);
	}
}
