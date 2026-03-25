import { Injectable } from '@angular/core';

import { AUTH_STORAGE_KEYS } from '../models/auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthTokenStorageService {
	/**
	 * Sets the access token in localStorage.
	 */
	public setAccessToken(accessToken: string): void {
		localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
	}

	/**
	 * Gets the access token from localStorage.
	 */
	public getAccessToken(): string | null {
		return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
	}

	/**
	 * Clears the access token from localStorage.
	 */
	public clearAccessToken(): void {
		localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
	}
}
