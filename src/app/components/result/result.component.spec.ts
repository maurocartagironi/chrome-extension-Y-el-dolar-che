import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ResultComponent } from './result.component';

describe('ResultComponent', () => {
	let component: ResultComponent;
	let fixture: ComponentFixture<ResultComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ResultComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ResultComponent);
		component = fixture.componentInstance;
		component.compra = '$ 10.000,00';
		component.venta = '$ 8.000,00';
		fixture.detectChanges();
	});

	it('muestra los dos valores', () => {
		const texto = fixture.nativeElement.textContent;
		expect(texto).toContain('10.000,00');
		expect(texto).toContain('8.000,00');
	});

	it('copia el número sin el símbolo de moneda', () => {
		const clipboard = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

		component.copyToClipboard('compra');

		expect(clipboard).toHaveBeenCalledWith('10.000,00');
	});

	// Con OnPush, el setTimeout que apaga el toast no repinta solo. Se hace el
	// click real sobre la tarjeta, que es el camino que usa la extensión.
	it('muestra el toast y lo apaga a los 2 segundos', fakeAsync(() => {
		spyOn(navigator.clipboard, 'writeText').and.resolveTo();

		fixture.nativeElement.querySelectorAll('.result-card')[1].click();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.toast-notification').classList).toContain('show');

		tick(2000);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.toast-notification').classList).not.toContain('show');
	}));

	it('no copia nada si no hay un número válido', () => {
		const clipboard = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
		component.compra = undefined;

		component.copyToClipboard('compra');

		expect(clipboard).not.toHaveBeenCalled();
	});
});
