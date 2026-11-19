import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { evaluateDarkMode, getLocalStorage, setLocalStorage } from '@shared/utils';
import { ChromeService } from '@shared/utils/chrome.utils';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
	constructor(private chromeService: ChromeService) {}

	@Output() refresh = new EventEmitter();
	currentMode: string = '';
	isDarkMode: boolean = false;
	hoveredIcon: string | null = null;
	config: Config = new Config();

	async ngOnInit(): Promise<void> {
		this.config = new Config((await getLocalStorage(LOCALSTORAGE_CONFIG)) ?? {});
		this.currentMode = this.config.darkMode;
		this.isDarkMode = evaluateDarkMode(this.currentMode);
	}

	async toggleDarkMode() {
		this.currentMode = this.currentMode === 'auto' ? 'dark' : this.currentMode === 'dark' ? 'light' : 'auto';
		this.config.darkMode = this.currentMode;
		await setLocalStorage(LOCALSTORAGE_CONFIG, this.config);
		this.isDarkMode = evaluateDarkMode(this.currentMode);
		this.refreshData();
	}

	getIcon(): string {
		return this.currentMode === 'auto' ? 'pi pi-globe' : this.currentMode === 'dark' ? 'pi pi-moon' : 'pi pi-sun';
	}

	onMouseEnter() {
		this.hoveredIcon = this.currentMode === 'auto' ? 'pi pi-moon' : this.currentMode === 'dark' ? 'pi pi-sun' : 'pi pi-globe';
	}

	onMouseLeave() {
		this.hoveredIcon = null;
	}

	refreshData() {
		this.refresh.emit();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
