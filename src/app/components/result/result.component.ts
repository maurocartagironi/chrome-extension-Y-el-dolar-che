import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
    selector: 'app-result',
    imports: [CommonModule],
    templateUrl: './result.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './result.component.scss'
})
export class ResultComponent {
	@Input() compra: string | undefined;
	@Input() venta: string | undefined;

	toastVisible = false;
	private toastTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private changeDetector: ChangeDetectorRef) {}

	copyToClipboard(type: 'compra' | 'venta') {
		const raw = type === 'compra' ? this.compra : this.venta;
		const cleaned = raw?.replace(/[^0-9,]/g, '').replace(',', '.') ?? '';
		const number = Number.parseFloat(cleaned);
		if (!Number.isNaN(number)) {
			navigator.clipboard.writeText(number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
		}
		this.toastVisible = true;
		if (this.toastTimer) clearTimeout(this.toastTimer);
		this.toastTimer = setTimeout(() => {
			this.toastVisible = false;
			// Con OnPush el timeout no dispara change detection por sí solo.
			this.changeDetector.markForCheck();
		}, 2000);
	}
}
