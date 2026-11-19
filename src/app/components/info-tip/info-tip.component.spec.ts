import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTipComponent } from './info-tip.component';

describe('InfoTipComponent', () => {
	let component: InfoTipComponent;
	let fixture: ComponentFixture<InfoTipComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [InfoTipComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(InfoTipComponent);
		component = fixture.componentInstance;
		component.text = 'Elegí el tipo de cambio del indicador.';
		fixture.detectChanges();
	});

	it('se crea', () => {
		expect(component).toBeTruthy();
	});

	// El globo se dibuja con un ::after que lee data-tip, así que el texto
	// tiene que llegar al atributo.
	it('pone el texto en data-tip', () => {
		const tip = fixture.nativeElement.querySelector('.info-tip');

		expect(tip.getAttribute('data-tip')).toBe('Elegí el tipo de cambio del indicador.');
	});

	it('es alcanzable con el teclado y se anuncia', () => {
		const tip = fixture.nativeElement.querySelector('.info-tip');

		expect(tip.getAttribute('tabindex')).toBe('0');
		expect(tip.getAttribute('aria-label')).toBe('Elegí el tipo de cambio del indicador.');
	});

	// El icono es un SVG propio: con el emoji ℹ️ cada sistema dibujaba otra cosa.
	it('dibuja el icono como svg, no como emoji', () => {
		const svg = fixture.nativeElement.querySelector('.info-tip svg.info-icon');

		expect(svg).not.toBeNull();
		expect(svg.getAttribute('aria-hidden')).toBe('true');
		expect(fixture.nativeElement.textContent.trim()).toBe('');
	});
});
