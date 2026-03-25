import { Routes } from '@angular/router';

import { guestGuard } from '../../core/guards/guest.guard';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { OAuthCallbackPageComponent } from './pages/oauth-callback-page/oauth-callback-page.component';

export const authRoutes: Routes = [
	{
		path: 'auth',
		canActivate: [guestGuard],
		children: [
			{
				path: 'oauth-callback',
				component: OAuthCallbackPageComponent,
				title: 'Signing in'
			},
			{
				path: 'sign-in',
				component: SignInPageComponent,
				title: 'Sign in'
			},
			{
				path: '',
				redirectTo: 'sign-in',
				pathMatch: 'full'
			}
		]
	}
];
