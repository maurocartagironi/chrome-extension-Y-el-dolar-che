import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './table.component.scss',
})
export class TableComponent {
	@Input() exchangeRates: ExchangeRate[] = [];
	copiedText = '';
	private toastTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private changeDetector: ChangeDetectorRef) {}

	trackByCasa(_index: number, rate: ExchangeRate): string {
		return rate.casa;
	}

	toCurrencyPesos(value: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS',
			minimumFractionDigits: 2,
		}).format(value);
	}

	copyPrice(value: number) {
		const formatted = value.toLocaleString('es-AR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		navigator.clipboard.writeText(formatted);
		this.copiedText = `${this.toCurrencyPesos(value)} copiado`;
		this.scheduleToastHide();
	}

	private scheduleToastHide(): void {
		if (this.toastTimer) clearTimeout(this.toastTimer);
		this.toastTimer = setTimeout(() => {
			this.copiedText = '';
			// Con OnPush el timeout no dispara change detection por sí solo.
			this.changeDetector.markForCheck();
		}, 2000);
	}
}
