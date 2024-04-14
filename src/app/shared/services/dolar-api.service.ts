import { Injectable } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { formatError } from '@shared/utils/error.utils';
import { ENDPOINT } from 'src/app/shared/constants/api.constant';

@Injectable({
  	providedIn: 'root',
})

export class DolarAPIService {
  	constructor() {}
  
	async getAll(): Promise<any> {
	   try {
			const response = await fetch(ENDPOINT);
			if (!response.ok) {
				throw new Error(response.status.toString());
			}
		  	const data = await response.json();
		  	return data;
	   } catch (error: any) {
			throw new Error(formatError("Error en la solicitud"));
	   }
	}

	async getByType(type: string): Promise<ExchangeRate> {
		try {
		   	const response = await fetch(ENDPOINT + '/' + type);
			if (!response.ok) {
				throw new Error(response.status.toString());
			}
		   	const data = await response.json();
		   	return new ExchangeRate(data.casa, data.nombre, data.compra, data.venta, data.fechaActualizacion);
		} catch (error: any) {
			throw new Error(formatError("Error en la solicitud"));
		}
	 }
}
