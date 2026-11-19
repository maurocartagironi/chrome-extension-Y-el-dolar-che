import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCALSTORAGE_CONFIG } from '@shared/constants/storage.constant';
import { Config } from '@shared/models/Config';
import { setLocalStorage } from '@shared/utils/storage.util';
import { installChromeMock } from 'src/testing/chrome-mock';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
	let component: HeaderComponent;
	let fixture: ComponentFixture<HeaderComponent>;

	beforeEach(async () => {
		const mock = installChromeMock();
		mock.i18n.messages['label_darkmode'] = 'Cambiar a modo oscuro';
		mock.i18n.messages['label_refresh'] = 'Actualizar';

		await TestBed.configureTestingModule({
			imports: [HeaderComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(HeaderComponent);
		component = fixture.componentInstance;
	});

	// Con OnPush, ngOnInit lee la config con await: sin markForCheck el header
	// se quedaría con el estado inicial.
	it('toma el modo guardado y lo refleja en el DOM', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ darkMode: 'dark' }));

		await component.ngOnInit();
		fixture.detectChanges();

		expect(component.currentMode).toBe('dark');
		expect(component.isDarkMode).toBeTrue();
		expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toContain('logo-dark');
	});

	it('cicla auto -> dark -> light -> auto y lo guarda', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ darkMode: 'auto' }));
		await component.ngOnInit();

		await component.toggleDarkMode();
		expect(component.currentMode).toBe('dark');

		await component.toggleDarkMode();
		expect(component.currentMode).toBe('light');

		await component.toggleDarkMode();
		expect(component.currentMode).toBe('auto');
	});

	it('avisa al padre cuando se cambia el modo', async () => {
		await setLocalStorage(LOCALSTORAGE_CONFIG, new Config({ darkMode: 'light' }));
		await component.ngOnInit();
		const avisos: unknown[] = [];
		component.refresh.subscribe((value) => avisos.push(value));

		await component.toggleDarkMode();

		expect(avisos.length).toBe(1);
	});

	it('el icono acompaña el modo actual', () => {
		component.currentMode = 'dark';
		expect(component.getIcon()).toContain('pi-moon');
		component.currentMode = 'light';
		expect(component.getIcon()).toContain('pi-sun');
		component.currentMode = 'auto';
		expect(component.getIcon()).toContain('pi-globe');
	});
});
