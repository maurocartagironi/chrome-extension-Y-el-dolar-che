export class ExchangeRate {
	casa: string;
	nombre: string;
	compra: number;
	venta: number;
	updatedCompra: string;
	updatedVenta: string;
	/** ISO-8601 tal como lo devuelve la API (lo que se guarda en storage es JSON, no un Date). */
	fechaActualizacion: string;

	constructor(
		casa?: string,
		nombre?: string,
		compra?: number,
		venta?: number,
		fechaActualizacion?: string,
		updatedCompra?: string,
		updatedVenta?: string,
	) {
		this.casa = casa || '';
		this.nombre = nombre || '';
		this.compra = compra || 0;
		this.venta = venta || 0;
		this.fechaActualizacion = fechaActualizacion || new Date().toISOString();
		this.updatedCompra = updatedCompra || '';
		this.updatedVenta = updatedVenta || '';
	}
}
