import { Injectable } from '@angular/core';

declare const chrome: any;

@Injectable({
  providedIn: 'root'
})
export class ChromeService {
  getMessage(key: string): string {
    return chrome.i18n.getMessage(key);
  }
}
