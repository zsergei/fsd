import { Routes } from '@angular/router';

import { getShellRouteData } from '../../shared/layouts/shell-layout/utils/shell.utils';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const dashboardRoutes: Routes = [
	{
		path: 'dashboard',
		component: DashboardPageComponent,
		data: getShellRouteData('dashboard', 'Dashboard')
	}
];
