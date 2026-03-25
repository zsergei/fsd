/** OAuth protocol keys returned in the URL hash fragment. */
export const OAUTH_FRAGMENT_PARAMS = {
	ACCESS_TOKEN: 'access_token',
	ERROR: 'error'
} as const;

/** Backend API paths used by auth feature (relative to apiBaseUrl). */
export const AUTH_API_PATHS = {
	AIRTABLE_AUTHORIZE: '/oauth/airtable/authorize',
	REFRESH_TOKEN: '/auth/refresh',
	ME: '/auth/me',
	LOGOUT: '/auth/logout'
} as const;

/** localStorage keys for auth tokens. */
export const AUTH_STORAGE_KEYS = {
	ACCESS_TOKEN: 'access_token'
} as const;

/** Application route paths used by auth feature. */
export const AUTH_ROUTE_PATHS = {
	SIGN_IN: '/auth/sign-in',
	DASHBOARD: '/dashboard'
} as const;
