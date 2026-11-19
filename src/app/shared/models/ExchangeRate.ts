export class ExchangeRate {
	casa: string;
	nombre: string;
	compra: number;
	venta: number;
	updatedCompra: string;
	updatedVenta: string;
	fechaActualizacion: Date;

	constructor(
		casa?: string,
		nombre?: string,
		compra?: number,
		venta?: number,
		fechaActualizacion?: Date,
		updatedCompra?: string,
		updatedVenta?: string,
	) {
		this.casa = casa || '';
		this.nombre = nombre || '';
		this.compra = compra || 0;
		this.venta = venta || 0;
		this.fechaActualizacion = fechaActualizacion || new Date();
		this.updatedCompra = updatedCompra || '';
		this.updatedVenta = updatedVenta || '';
	}
}
