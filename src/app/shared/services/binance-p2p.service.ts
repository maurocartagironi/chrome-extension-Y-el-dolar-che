import { Injectable } from '@angular/core';
import { ENDPOINT_P2P } from 'src/app/shared/constants/api.constant';

@Injectable({
	providedIn: 'root',
})
export class BinanceP2PService {
	constructor() {}

	async get(): Promise<any> {
		try {
			const response = await fetch(ENDPOINT_P2P, {
				method: 'POST',
				headers: {
					Accept: '*/*',
					'Accept-Encoding': 'gzip, deflate, br',
					'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					'Content-Type': 'application/json',
					Host: 'p2p.binance.com',
					Origin: 'https://p2p.binance.com',
					Pragma: 'no-cache',
					TE: 'Trailers',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
				},
				body: JSON.stringify({
					asset: 'USDT',
					fiat: 'ARS',
					tradeType: 'SELL',
					page: 1,
					rows: 1,
					payTypes: ['MercadoPagoNew'],
					publisherType: 'merchant',
					merchantCheck: true,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('data', data);
			return data;
		} catch (error: any) {
			console.error(error);
			throw new Error('Error en la solicitud a Binance');
		}
	}
}
