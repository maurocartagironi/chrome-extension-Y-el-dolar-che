import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { CurrencyPipe } from '@angular/common';

import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableModule, CommonModule, CurrencyPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
	@Input() exchangeRates: ExchangeRate[] = [];
	public exchangeRatesUpdated: any[] = [];

	ngOnInit() {
		const formatter = new Intl.NumberFormat('es-AR', {
			style: 'currency',
			minimumFractionDigits: 2,
			currency: 'ARS'
		});
		  
		this.exchangeRates.forEach((exchangeRate) => {
			this.exchangeRatesUpdated.push({
				nombre: exchangeRate.nombre,
				compra: formatter.format(exchangeRate.compra),
				venta: formatter.format(exchangeRate.venta)
			});
		});
	}
}
