import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

/**
 * El popup y la página de opciones comparten el mismo index.html y se
 * distinguen por el query param `target`.
 */
export const targetGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);
	const target = route.queryParams['target'];

	if (target === 'popup') {
		document.body.classList.add(target);
		router.navigate(['/popup']);
		return false;
	}

	return true;
};
