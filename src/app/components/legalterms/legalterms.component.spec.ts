import { ComponentFixture, TestBed } from '@angular/core/testing';

import { installChromeMock } from 'src/testing/chrome-mock';
import { LegalTermsComponent } from './legalterms.component';

describe('LegalTermsComponent', () => {
	let component: LegalTermsComponent;
	let fixture: ComponentFixture<LegalTermsComponent>;

	beforeEach(async () => {
		const mock = installChromeMock();
		mock.i18n.messages['legal_terms_title'] = 'Términos y condiciones';
		mock.i18n.messages['legal_terms_text'] = 'Texto legal con <b>negrita</b>.';

		await TestBed.configureTestingModule({
			imports: [LegalTermsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LegalTermsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('arranca cerrado', () => {
		expect(fixture.nativeElement.querySelector('.modal')).toBeNull();
	});

	// El popup lo abre por ViewChild desde su propio template: con OnPush, sin
	// markForCheck el modal no se renderiza nunca.
	it('se renderiza al abrirlo desde afuera', () => {
		component.openModal();
		fixture.detectChanges();

		const modal = fixture.nativeElement.querySelector('.modal');
		expect(modal).not.toBeNull();
		expect(modal.textContent).toContain('Términos y condiciones');
	});

	it('desaparece al cerrarlo', () => {
		component.openModal();
		fixture.detectChanges();

		component.closeModal();
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.modal')).toBeNull();
	});
});
