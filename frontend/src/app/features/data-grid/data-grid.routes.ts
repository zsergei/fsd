import { Routes } from '@angular/router';

import { getShellRouteData } from '../../shared/layouts/shell-layout/utils/shell.utils';
import { DataGridPageComponent } from './pages/data-grid-page/data-grid-page.component';

export const dataGridRoutes: Routes = [
	{
		path: 'data-grid',
		component: DataGridPageComponent,
		data: getShellRouteData('data-grid', 'Data grid')
	}
];
