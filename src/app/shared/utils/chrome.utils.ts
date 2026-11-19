import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class ChromeService {
	/** Los mensajes sin sustituciones no cambian en runtime: se cachean para no
	 * pagar un lookup de i18n por cada ciclo de change detection. */
	private readonly cache = new Map<string, string>();

	getMessage(key: string, substitutions?: string | string[]): string {
		if (substitutions !== undefined) {
			return chrome.i18n.getMessage(key, substitutions);
		}

		const cached = this.cache.get(key);
		if (cached !== undefined) return cached;

		const message = chrome.i18n.getMessage(key);
		this.cache.set(key, message);
		return message;
	}
}
