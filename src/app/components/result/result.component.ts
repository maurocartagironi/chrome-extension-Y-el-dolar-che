import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, PanelModule, ButtonModule, MenuModule, TooltipModule, ToastModule, RippleModule],
  providers: [MessageService],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
	@Input() compra: string | undefined;
	@Input() venta: string | undefined;

	constructor(private messageService: MessageService) {}

	copyToClipboard(currencyType: string) {
		let text = currencyType === 'compra' ? this.compra : this.venta;
		let cleanedStr = text?.replace(/[^0-9,]/g, '');
		cleanedStr = cleanedStr?.replace(',', '.');
		let number = cleanedStr ? parseFloat(cleanedStr) : 0;
		let formattedNumber = number.toLocaleString('es-ES', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
		navigator.clipboard.writeText(formattedNumber?.toString() || '');
		this.messageService.add({ key:'myKey', severity: 'success', detail: currencyType === 'compra' ? 'Se ha copiado el valor de compra' : 'Se ha copiado el valor de venta' });
	}
}
