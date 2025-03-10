import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { evaluateDarkMode, getLocalStorage, setLocalStorage } from '@shared/utils';
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
	currentMode: string = '';
	isDarkMode: boolean = false;
	hoveredIcon: string | null = null;
	config: Config = new Config();

	async ngOnInit(): Promise<void> {
		this.config = (await getLocalStorage(LOCALSTORAGE_CONFIG)) as Config;
		this.currentMode = this.config.darkMode;
		this.isDarkMode = evaluateDarkMode(this.currentMode);
	}

	toggleDarkMode() {
		this.currentMode = this.currentMode === 'auto' ? 'dark' : this.currentMode === 'dark' ? 'light' : 'auto';
		this.config.darkMode = this.currentMode;
		setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.isDarkMode = evaluateDarkMode(this.currentMode);
		this.refreshData();
	}

	getIcon(): string {
		return this.currentMode === 'auto' ? 'pi pi-globe' : this.currentMode === 'dark' ? 'pi pi-moon' : 'pi pi-sun';
	}

	onMouseEnter() {
		if (this.currentMode === 'auto') {
			this.hoveredIcon = 'pi pi-moon';
		} else if (this.currentMode === 'dark') {
			this.hoveredIcon = 'pi pi-sun';
		} else {
			this.hoveredIcon = 'pi pi-globe';
		}
	}

	onMouseLeave() {
		this.hoveredIcon = null;
	}

	refreshData() {
		this.onRefresh.emit();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
