import { DailyClose } from '@shared/models/DailyClose';

/**
 * La fecha de hoy en Argentina, en el mismo formato que usa la API.
 *
 * No sirve `toISOString()`: entre las 21 y la medianoche de acá, en UTC ya es
 * el día siguiente, y el "cierre anterior" se correría un día.
 */
export function todayInArgentina(now: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(now);
}

/**
 * El último cierre anterior a hoy. La serie trae también el valor de hoy, que
 * no sirve como referencia porque es contra lo que se compara.
 */
export function previousClose(series: DailyClose[] | undefined, today: string = todayInArgentina()): DailyClose | undefined {
	if (!series?.length) return undefined;

	for (let index = series.length - 1; index >= 0; index--) {
		const close = series[index];
		if (close.fecha < today) return close;
	}

	return undefined;
}

/** Variación entre dos precios, como proporción (0,016 = 1,6 %). */
export function ratioChange(previous: number, current: number): number | null {
	if (!Number.isFinite(previous) || !Number.isFinite(current) || previous <= 0) return null;
	return (current - previous) / previous;
}
