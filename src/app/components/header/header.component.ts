import { Component, EventEmitter, Output } from '@angular/core';
import { ChromeService } from '@shared/utils/chrome.utils';

import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup'
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, ButtonGroupModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
	constructor(private chromeService: ChromeService) {}
	
	@Output() onRefresh = new EventEmitter();

	refreshData() {
		this.onRefresh.emit();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
