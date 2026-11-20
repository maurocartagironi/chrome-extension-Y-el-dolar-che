import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, inject } from '@angular/core';
import { DailyClose, RateHistory } from '@shared/models/DailyClose';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { ChromeService } from '@shared/utils/chrome.utils';
import { previousClose, ratioChange } from '@shared/utils/variation.util';

export type Trend = 'up' | 'down' | 'neutral';

export interface PriceCell {
	value: number;
	text: string;
	trend: Trend;
}

/** Una fila ya calculada: el template solo pinta, no hace cuentas. */
export interface RateRow {
	casa: string;
	nombre: string;
	compra: PriceCell;
	venta: PriceCell;
	/** Variación del día sobre el precio de venta. */
	variation: { text: string; trend: Trend } | null;
	/** Puntos del sparkline dentro del viewBox, o null si no hay serie. */
	spark: string | null;
}

/** Tamaño del sparkline en unidades del viewBox. */
const SPARK_WIDTH = 56;
const SPARK_HEIGHT = 16;
/** Margen para que el trazo no quede cortado arriba y abajo. */
const SPARK_INSET = 1.5;

@Component({
	selector: 'app-table',
	imports: [NgClass],
	templateUrl: './table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './table.component.scss',
})
export class TableComponent implements OnChanges {
	private changeDetector = inject(ChangeDetectorRef);
	private chromeService = inject(ChromeService);

	@Input() exchangeRates: ExchangeRate[] = [];
	/** Cierres diarios por casa. Llega después que las cotizaciones. */
	@Input() history: RateHistory = {};

	public rows: RateRow[] = [];
	copiedText = '';
	private toastTimer: ReturnType<typeof setTimeout> | null = null;

	private readonly currencyFormatter = new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 2,
	});

	private readonly percentFormatter = new Intl.NumberFormat('es-AR', {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
		signDisplay: 'exceptZero',
	});

	ngOnChanges(): void {
		this.rows = this.exchangeRates.map((rate) => this.buildRow(rate));
	}

	private buildRow(rate: ExchangeRate): RateRow {
		const serie = this.history[rate.casa];
		const anterior = previousClose(serie);

		const compraRatio = anterior ? ratioChange(anterior.compra, rate.compra) : null;
		const ventaRatio = anterior ? ratioChange(anterior.venta, rate.venta) : null;

		return {
			casa: rate.casa,
			nombre: rate.nombre,
			compra: this.buildCell(rate.compra, compraRatio, rate.updatedCompra),
			venta: this.buildCell(rate.venta, ventaRatio, rate.updatedVenta),
			variation:
				ventaRatio === null
					? null
					: {
							text: this.percentFormatter.format(ventaRatio),
							trend: this.trendOf(ventaRatio),
						},
			spark: this.sparkline(serie),
		};
	}

	/**
	 * El chip se pinta con la variación del día. Mientras el histórico no haya
	 * llegado se usa la comparación contra el sondeo anterior, que es lo que
	 * hacía antes.
	 */
	private buildCell(value: number, ratio: number | null, fallback: string): PriceCell {
		return {
			value,
			text: this.toCurrencyPesos(value),
			trend: ratio === null ? this.trendClass(fallback) : this.trendOf(ratio),
		};
	}

	private trendOf(ratio: number): Trend {
		if (ratio > 0) return 'up';
		if (ratio < 0) return 'down';
		return 'neutral';
	}

	/** El color del chip: rojo si subió, verde si bajó, gris si no cambió. */
	trendClass(trend: string): Trend {
		if (trend === 'arrow-trend-up') return 'up';
		if (trend === 'arrow-trend-down') return 'down';
		return 'neutral';
	}

	/**
	 * Los puntos de la polilínea, con la serie escalada a la caja. Se necesitan
	 * al menos dos cierres y que no sean todos iguales.
	 */
	private sparkline(serie: DailyClose[] | undefined): string | null {
		const valores = (serie ?? []).map((close) => close.venta).filter((value) => Number.isFinite(value));
		if (valores.length < 2) return null;

		const min = Math.min(...valores);
		const max = Math.max(...valores);
		const alto = SPARK_HEIGHT - SPARK_INSET * 2;
		const rango = max - min;
		const paso = SPARK_WIDTH / (valores.length - 1);

		return valores
			.map((valor, index) => {
				// Serie plana: la línea va por el medio en vez de dividir por cero.
				const proporcion = rango === 0 ? 0.5 : (valor - min) / rango;
				const y = SPARK_HEIGHT - SPARK_INSET - proporcion * alto;
				return `${(index * paso).toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	toCurrencyPesos(value: number): string {
		return this.currencyFormatter.format(value);
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
