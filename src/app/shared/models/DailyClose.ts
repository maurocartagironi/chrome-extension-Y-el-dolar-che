/** El cierre de un día, tal como lo devuelve la API de históricos. */
export interface DailyClose {
	/** YYYY-MM-DD, en hora argentina. */
	fecha: string;
	compra: number;
	venta: number;
}

/** Serie de cierres por casa de cambio: `{ blue: [...], oficial: [...] }`. */
export type RateHistory = Record<string, DailyClose[]>;
