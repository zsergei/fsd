import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { AuthRefreshService } from '../../features/auth/services/auth-refresh.service';
import { AUTH_API_PATHS, AUTH_ROUTE_PATHS } from '../../features/auth/models/auth.constants';
import { AuthTokenStorageService } from '../../features/auth/services/auth-token-storage.service';

/**
 * Attaches `Authorization: Bearer` header when a token is available.
 * On a 401 response, attempts a silent token refresh and retries once.
 * The refresh endpoint itself is excluded to prevent infinite loops.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const router = inject(Router);
	const tokenStorage = inject(AuthTokenStorageService);
	const refreshService = inject(AuthRefreshService);

	const token = tokenStorage.getAccessToken();
	const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

	return next(authReq).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status !== 401 || req.url.includes(AUTH_API_PATHS.REFRESH_TOKEN)) {
				return throwError(() => error);
			}

			return refreshService.refreshOrQueue().pipe(
				switchMap(() => {
					const freshToken = tokenStorage.getAccessToken();
					if (!freshToken) return throwError(() => error);
					return next(req.clone({ setHeaders: { Authorization: `Bearer ${freshToken}` } }));
				}),
				catchError(() => {
					tokenStorage.clearAccessToken();
					void router.navigate([AUTH_ROUTE_PATHS.SIGN_IN]);
					return throwError(() => error);
				})
			);
		})
	);
};
