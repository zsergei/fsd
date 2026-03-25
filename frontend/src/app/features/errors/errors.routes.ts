import { Routes } from '@angular/router';

import { errorPageTitleResolver } from './utils/errors.utils';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { PublicLayoutComponent } from '../../shared/layouts/public-layout/layout/public-layout.component';

export const errorRoutes: Routes = [
	{
		path: 'error',
		component: PublicLayoutComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: '404' },
			{ path: ':code', component: ErrorPageComponent, title: errorPageTitleResolver }
		]
	}
];
