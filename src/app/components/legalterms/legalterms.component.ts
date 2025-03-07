import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChromeService } from '@shared/utils/chrome.utils';

@Component({
	selector: 'legal-terms',
	templateUrl: './legalterms.component.html',
	imports: [CommonModule],
	styleUrls: ['./legalterms.component.scss'],
	standalone: true,
})
export class LegalTermsComponent {
	constructor(public chromeService: ChromeService) {}
	isOpen = false; // Determina si el modal está abierto

	// Método para abrir el modal
	openModal() {
		this.isOpen = true;
	}

	// Método para cerrar el modal
	closeModal() {
		this.isOpen = false;
	}

	getChromeMessage(key: string): string {
		return this.chromeService.getMessage(key);
	}
}
