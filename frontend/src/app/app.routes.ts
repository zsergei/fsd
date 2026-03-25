import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './features/auth/auth.routes';
import { legalRoutes } from './features/legal/legal.routes';
import { errorRoutes } from './features/errors/errors.routes';
import { dataGridRoutes } from './features/data-grid/data-grid.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { shellLayoutRoutes } from './shared/layouts/shell-layout/shell-layout.routes';
import { ShellLayoutComponent } from './shared/layouts/shell-layout/layout/shell-layout.component';

export const routes: Routes = [
	{
		path: '',
		component: ShellLayoutComponent,
		canActivate: [authGuard],
		children: [{ path: '', pathMatch: 'full', redirectTo: 'dashboard' }, ...dashboardRoutes, ...dataGridRoutes, ...shellLayoutRoutes]
	},
	...authRoutes,
	...legalRoutes,
	...errorRoutes,
	{ path: '**', pathMatch: 'full', redirectTo: 'error/404' }
];
