import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { getLocalStorage, setLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';

import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [ButtonModule, ButtonGroupModule, TooltipModule, CommonModule],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent {
	constructor(private chromeService: ChromeService) {}

	@Output() onRefresh = new EventEmitter();
	isDarkMode: boolean = false;
	config: Config = new Config();

	async ngOnInit(): Promise<void> {
		this.config = (await getLocalStorage(LOCALSTORAGE_CONFIG)) as Config;
		this.isDarkMode = this.config.darkMode;
	}

	toggleDarkMode() {
		this.isDarkMode = !this.isDarkMode;
		this.isDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
		this.config.darkMode = this.isDarkMode;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.refreshData();
	}

	refreshData() {
		this.onRefresh.emit();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
