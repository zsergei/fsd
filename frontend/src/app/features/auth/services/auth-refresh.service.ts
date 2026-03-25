import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, share, tap, timer } from 'rxjs';

import { AUTH_API_PATHS } from '../models/auth.constants';
import { AuthTokenStorageService } from './auth-token-storage.service';

/**
 * Rotates the refresh session via httpOnly cookie and stores the new access token.
 * Concurrent callers share a single in-flight request via `refreshOrQueue()`.
 */
@Injectable({ providedIn: 'root' })
export class AuthRefreshService {
	private readonly http = inject(HttpClient);
	private readonly tokenStorage = inject(AuthTokenStorageService);

	/**
	 * Triggers a token refresh or returns the already in-flight observable
	 * so concurrent 401 handlers share the same HTTP call.
	 */
	public refreshOrQueue(): Observable<{ accessToken: string }> {
		return this.sharedRefreshToken;
	}

	/**
	 * Shared refresh token observable.
	 */
	private readonly sharedRefreshToken = this.http.post<{ accessToken: string }>(AUTH_API_PATHS.REFRESH_TOKEN, {}).pipe(
		tap(body => this.tokenStorage.setAccessToken(body.accessToken)),
		share({ resetOnComplete: () => timer(0), resetOnError: () => timer(0) })
	);
}
