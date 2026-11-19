import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TargetGuard } from './target.guard';

const routeWith = (target?: string) => ({ queryParams: { target } }) as unknown as ActivatedRouteSnapshot;

describe('TargetGuard', () => {
	let guard: TargetGuard;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({ imports: [RouterTestingModule] });
		guard = TestBed.inject(TargetGuard);
		router = TestBed.inject(Router);
	});

	it('redirige a /popup cuando el target es popup', () => {
		const navigate = spyOn(router, 'navigate');

		expect(guard.canActivate(routeWith('popup'))).toBeFalse();
		expect(navigate).toHaveBeenCalledWith(['/popup']);
		expect(document.body.classList).toContain('popup');
	});

	it('deja pasar cualquier otro target sin redirigir', () => {
		const navigate = spyOn(router, 'navigate');

		expect(guard.canActivate(routeWith('otra-cosa'))).toBeTrue();
		expect(guard.canActivate(routeWith(undefined))).toBeTrue();
		expect(navigate).not.toHaveBeenCalled();
	});
});
