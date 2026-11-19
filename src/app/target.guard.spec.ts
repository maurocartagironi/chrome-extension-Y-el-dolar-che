import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { targetGuard } from './target.guard';

const routeWith = (target?: string) => ({ queryParams: { target } }) as unknown as ActivatedRouteSnapshot;

/** El guard usa inject(), así que corre dentro del contexto de inyección. */
const run = (target?: string) => TestBed.runInInjectionContext(() => targetGuard(routeWith(target), {} as any));

describe('targetGuard', () => {
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({ imports: [RouterTestingModule] });
		router = TestBed.inject(Router);
	});

	it('redirige a /popup cuando el target es popup', () => {
		const navigate = spyOn(router, 'navigate');

		expect(run('popup')).toBeFalse();
		expect(navigate).toHaveBeenCalledWith(['/popup']);
		expect(document.body.classList).toContain('popup');
	});

	it('deja pasar cualquier otro target sin redirigir', () => {
		const navigate = spyOn(router, 'navigate');

		expect(run('otra-cosa')).toBeTrue();
		expect(run(undefined)).toBeTrue();
		expect(navigate).not.toHaveBeenCalled();
	});
});
