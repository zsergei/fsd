import { HttpClient } from '@angular/common/http';
import { Observable, of, share, tap, timer } from 'rxjs';
import { inject, Injectable, signal } from '@angular/core';

import { AUTH_API_PATHS } from '../models/auth.constants';
import { AuthSessionProfile } from '../models/auth.interfaces';

/**
 * Stores the current user's session profile in a signal.
 * `ensureLoaded()` fetches once from `GET /auth/me` and caches;
 * concurrent callers share a single in-flight request.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
	private readonly http = inject(HttpClient);
	private readonly profileSignal = signal<AuthSessionProfile | null>(null);

	public readonly profile = this.profileSignal.asReadonly();

	private readonly sharedLoad = this.http.get<AuthSessionProfile>(AUTH_API_PATHS.ME).pipe(
		tap(profile => this.profileSignal.set(profile)),
		share({ resetOnComplete: () => timer(0), resetOnError: () => timer(0) })
	);

	/**
	 * Returns the cached profile immediately, or fetches it from the API.
	 * Concurrent calls share a single HTTP request.
	 */
	public ensureLoaded(): Observable<AuthSessionProfile> {
		const cached = this.profileSignal();
		if (cached) return of(cached);
		return this.sharedLoad;
	}

	/** Clears the cached profile (call on logout). */
	public clear(): void {
		this.profileSignal.set(null);
	}
}
