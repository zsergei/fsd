import { sanitizeUrl } from '../../../shared/utils/url-sanitizer.util.js';

const FRONTEND_CALLBACK_URL = '/auth/oauth-callback';

/**
 * @returns {string}
 */
function getSanitizedFrontendOrigin() {
	const origin = sanitizeUrl(process.env.FRONTEND_URL);
	if (origin == null) {
		throw new Error('FRONTEND_URL must be a valid http(s) URL without userinfo');
	}
	return origin;
}

/**
 * Builds the SPA URL after OAuth completes. Refresh is set via httpOnly cookie on the API response; fragment carries access only.
 * @param {string} accessToken - JWT access token for the app session.
 * @returns {string} Absolute URL with `#access_token=...`.
 */
export function buildOAuthSuccessCallbackUrl(accessToken) {
	const hash = new URLSearchParams({
		access_token: accessToken
	}).toString();

	return `${getSanitizedFrontendOrigin()}${FRONTEND_CALLBACK_URL}#${hash}`;
}

/**
 * Builds the SPA error page URL when OAuth fails; error message is placed in the fragment.
 * @param {string} message - Human-readable error (will be URL-encoded).
 * @returns {string} Absolute URL with `#error=...`.
 */
export function buildOAuthErrorCallbackUrl(message) {
	return `${getSanitizedFrontendOrigin()}/error/401#error=${encodeURIComponent(message)}`;
}
