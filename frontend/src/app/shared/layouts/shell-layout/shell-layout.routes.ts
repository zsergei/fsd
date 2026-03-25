import { Routes } from '@angular/router';

import { getShellRouteData } from './utils/shell.utils';
import { ShellRoutePlaceholderComponent } from './components/shell-route-placeholder/shell-route-placeholder.component';

export const shellLayoutRoutes: Routes = [
	{
		path: 'sync',
		component: ShellRoutePlaceholderComponent,
		data: getShellRouteData('sync', 'Synchronization')
	}
];
