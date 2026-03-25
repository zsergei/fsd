import { Routes } from '@angular/router';

import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';
import { PublicLayoutComponent } from '../../shared/layouts/public-layout/layout/public-layout.component';
import { TermsOfServicePageComponent } from './pages/terms-of-service-page/terms-of-service-page.component';

export const legalRoutes: Routes = [
	{
		path: 'legal',
		component: PublicLayoutComponent,
		children: [
			{ path: 'privacy-policy', component: PrivacyPolicyPageComponent, title: 'Privacy policy' },
			{ path: 'terms-of-service', component: TermsOfServicePageComponent, title: 'Terms of service' },
			{ path: '', pathMatch: 'full', redirectTo: 'privacy-policy' }
		]
	}
];
