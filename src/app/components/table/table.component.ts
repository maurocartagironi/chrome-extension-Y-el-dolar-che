import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { ChromeService } from '@shared/utils/chrome.utils';

@Component({
	selector: 'app-table',
	imports: [NgClass],
	templateUrl: './table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './table.component.scss',
})
export class TableComponent {
	private changeDetector = inject(ChangeDetectorRef);
	private chromeService = inject(ChromeService);

	@Input() exchangeRates: ExchangeRate[] = [];
	copiedText = '';
	private toastTimer: ReturnType<typeof setTimeout> | null = null;

	/** El color del chip: rojo si subió, verde si bajó, gris si no cambió. */
	trendClass(trend: string): string {
		if (trend === 'arrow-trend-up') return 'up';
		if (trend === 'arrow-trend-down') return 'down';
		return 'neutral';
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
		// Si el permiso de portapapeles falla no hay nada que hacer, pero la
		// promise sin manejar sí ensucia la consola.
		void navigator.clipboard.writeText(formatted).catch(() => undefined);
		this.copiedText = this.chromeService.getMessage('toast_copied_value', this.toCurrencyPesos(value));
		this.scheduleToastHide();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
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
