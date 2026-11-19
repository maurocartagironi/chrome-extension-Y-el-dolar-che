import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ChromeService } from '@shared/utils/chrome.utils';

@Component({
	selector: 'app-legal-terms',
	templateUrl: './legalterms.component.html',
	imports: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./legalterms.component.scss'],
})
export class LegalTermsComponent {
	chromeService = inject(ChromeService);
	private changeDetector = inject(ChangeDetectorRef);

	isOpen = false;

	/** Lo llama el popup por ViewChild: hay que marcar esta vista a mano. */
	openModal() {
		this.isOpen = true;
		this.changeDetector.markForCheck();
	}

	closeModal() {
		this.isOpen = false;
		this.changeDetector.markForCheck();
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
