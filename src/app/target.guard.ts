import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TargetGuard  {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const target = route.queryParams['target'];
    if (['popup', 'options'].includes(target)) {
      document.body.classList.add(target);
      this.router.navigate([`/${target}`]);
      return false;
    }
    return true;
  }
}
