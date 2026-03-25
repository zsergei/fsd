import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, catchError, finalize } from 'rxjs';

import { AuthSessionService } from './auth-session.service';
import { AuthTokenStorageService } from './auth-token-storage.service';
import { AUTH_API_PATHS, AUTH_ROUTE_PATHS } from '../models/auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthLogoutService {
	private readonly http = inject(HttpClient);
	private readonly router = inject(Router);
	private readonly sessionService = inject(AuthSessionService);
	private readonly tokenStorage = inject(AuthTokenStorageService);

	/**
	 * Revokes all server sessions, clears the refresh cookie and local access token,
	 * then navigates to sign-in. Client-side cleanup runs even if the HTTP call fails.
	 */
	public logout(): void {
		this.http
			.post(AUTH_API_PATHS.LOGOUT, {}, { responseType: 'text' })
			.pipe(
				catchError(() => EMPTY),
				finalize(() => {
					this.sessionService.clear();
					this.tokenStorage.clearAccessToken();
					void this.router.navigate([AUTH_ROUTE_PATHS.SIGN_IN]);
				})
			)
			.subscribe();
	}
}
