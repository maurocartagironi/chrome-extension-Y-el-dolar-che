import { Injectable } from '@angular/core';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { formatError } from '@shared/utils/error.utils';
import { ENDPOINT } from 'src/app/shared/constants/api.constant';

@Injectable({
  	providedIn: 'root',
})

export class DolarAPIService {
  	constructor() {}

	async getAll(url?: string): Promise<ExchangeRate[]> {
	   try {
			const response = await fetch(url ? url : ENDPOINT);
			if (!response.ok) {
				throw new Error(response.status.toString());
			}
		  	const data = await response.json();			
			return data as ExchangeRate[];
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
		   	return data as ExchangeRate;
		} catch (error: any) {
			throw new Error(formatError("Error en la solicitud"));
		}
	 }
}
