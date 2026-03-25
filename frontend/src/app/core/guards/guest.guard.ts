import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { isTokenExpired } from '../../features/auth/utils/jwt-decode.util';
import { AUTH_ROUTE_PATHS } from '../../features/auth/models/auth.constants';
import { AuthTokenStorageService } from '../../features/auth/services/auth-token-storage.service';

/**
 * Allows navigation only for unauthenticated users.
 * Redirects to the dashboard when a valid access token is present.
 */
export const guestGuard: CanActivateFn = () => {
	const router = inject(Router);
	const tokenStorage = inject(AuthTokenStorageService);

	const token = tokenStorage.getAccessToken();

	if (token && !isTokenExpired(token)) {
		return router.createUrlTree([AUTH_ROUTE_PATHS.DASHBOARD]);
	}

	return true;
};
