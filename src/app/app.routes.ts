import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { targetGuard } from './target.guard';

export const routes: Routes = [
	{
		path: 'popup',
		loadComponent: () => import('@containers/popup/popup.component').then((m) => m.PopupComponent),
	},
	{ path: '**', component: AppComponent, canActivate: [targetGuard] },
];
