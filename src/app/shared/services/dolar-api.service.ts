import { Injectable } from '@angular/core';
import { LOCALSTORAGE_EXCHANGERATES, LOCALSTORAGE_LAST_UPDATED } from '@shared/constants/storage.constant';
import { ExchangeRate } from '@shared/models/ExchangeRate';
import { getLocalStorage, setLocalStorage } from '@shared/utils/storage.util';
import { ENDPOINT } from 'src/app/shared/constants/api.constant';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({
	providedIn: 'root',
})
export class DolarAPIService {
	private abortController: AbortController | null = null;

	constructor() {}

	async getAll(forceRefresh = false): Promise<ExchangeRate[]> {
		if (!forceRefresh) {
			const cached = await this.getCachedRates();
			if (cached) return cached;
		}

		this.abortController?.abort();
		this.abortController = new AbortController();

		try {
			const response = await fetch(ENDPOINT, { signal: this.abortController.signal });
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			const data: ExchangeRate[] = await response.json();
			await setLocalStorage(LOCALSTORAGE_EXCHANGERATES, data);
			return data;
		} catch (error: any) {
			if (error.name === 'AbortError') {
				throw error;
			}
			const fallback = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);
			if (fallback) return fallback;
			throw new Error(`<p>No se pudo obtener la cotización.</p><p>${error.message}</p>`);
		}
	}

	async getByType(type: string): Promise<ExchangeRate> {
		try {
			const response = await fetch(`${ENDPOINT}/${type}`);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			return await response.json() as ExchangeRate;
		} catch (error: any) {
			throw new Error(`<p>No se pudo obtener la cotización (${type}).</p><p>${error.message}</p>`);
		}
	}

	private async getCachedRates(): Promise<ExchangeRate[] | null> {
		const lastUpdated = await getLocalStorage(LOCALSTORAGE_LAST_UPDATED);
		if (!lastUpdated) return null;
		const age = Date.now() - Number(lastUpdated);
		if (age > CACHE_TTL_MS) return null;
		const cached = await getLocalStorage(LOCALSTORAGE_EXCHANGERATES);
		return cached ?? null;
	}
}
