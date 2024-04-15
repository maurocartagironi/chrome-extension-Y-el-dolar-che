export class ExchangeRate {
	casa: string;
	nombre: string;
	compra: number;
	venta: number;
	fechaActualizacion: Date;

	constructor(
		casa?: string,
		nombre?: string,
		compra?: number,
		venta?: number,
		fechaActualizacion?: Date
	) {
		this.casa = casa || "";
		this.nombre = (casa === "blue" ? chrome.i18n.getMessage("blue") : nombre) || "";
		this.compra = compra || 0;
		this.venta = venta || 0;
		this.fechaActualizacion = fechaActualizacion || new Date();
	}
}
