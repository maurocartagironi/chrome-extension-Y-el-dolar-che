import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule, AppComponent],
		}).compileComponents();
	});

	it('se crea', () => {
		const fixture = TestBed.createComponent(AppComponent);
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('renderiza el router-outlet', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).not.toBeNull();
	});
});
