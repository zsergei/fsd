import { inject } from '@angular/core';
import { catchError, map, of, switchMap } from 'rxjs';
import { CanActivateFn, Router } from '@angular/router';

import { isTokenExpired } from '../../features/auth/utils/jwt-decode.util';
import { AUTH_ROUTE_PATHS } from '../../features/auth/models/auth.constants';
import { AuthRefreshService } from '../../features/auth/services/auth-refresh.service';
import { AuthSessionService } from '../../features/auth/services/auth-session.service';
import { AuthTokenStorageService } from '../../features/auth/services/auth-token-storage.service';

/**
 * Allows navigation when a valid (non-expired) access token is present
 * and the session profile is loaded. If the token is missing or expired,
 * attempts a silent refresh via httpOnly cookie first.
 * On failure redirects to sign-in.
 */
export const authGuard: CanActivateFn = () => {
	const router = inject(Router);
	const tokenStorage = inject(AuthTokenStorageService);
	const refreshService = inject(AuthRefreshService);
	const sessionService = inject(AuthSessionService);

	const redirectToSignIn = () => {
		tokenStorage.clearAccessToken();
		return of(router.createUrlTree([AUTH_ROUTE_PATHS.SIGN_IN]));
	};

	const loadProfileAndAllow = () =>
		sessionService.ensureLoaded().pipe(
			map(() => true as boolean),
			catchError(() => redirectToSignIn())
		);

	const token = tokenStorage.getAccessToken();

	if (token && !isTokenExpired(token)) {
		return loadProfileAndAllow();
	}

	return refreshService.refreshOrQueue().pipe(
		switchMap(() => loadProfileAndAllow()),
		catchError(() => redirectToSignIn())
	);
};
