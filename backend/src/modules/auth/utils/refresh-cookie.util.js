import { getRefreshTokenTtlSeconds } from './jwt-helper.util.js';

const DEFAULT_COOKIE_PATH = '/';
const DEFAULT_COOKIE_NAME = 'refresh_token';

/**
 * @returns {string}
 */
export function getRefreshCookieName() {
	return process.env.REFRESH_COOKIE_NAME?.trim() || DEFAULT_COOKIE_NAME;
}

/**
 * Cookie path.
 * @returns {string}
 */
export function getRefreshCookiePath() {
	return process.env.REFRESH_COOKIE_PATH?.trim() || DEFAULT_COOKIE_PATH;
}

/**
 * `REFRESH_COOKIE_SECURE=true` on HTTPS; if unset, secure cookies only when `APP_ENV=prod`.
 * @returns {boolean}
 */
function isCookieSecure() {
	const secureFlag = process.env.REFRESH_COOKIE_SECURE?.trim().toLowerCase();
	if (secureFlag === 'true' || secureFlag === '1') return true;
	if (secureFlag === 'false' || secureFlag === '0') return false;

	return process.env.APP_ENV === 'prod';
}

/** @returns {import('express').CookieOptions} */
function refreshCookieBaseOptions() {
	const secure = isCookieSecure();

	return {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: getRefreshCookiePath()
	};
}

/**
 * Sets the httpOnly refresh JWT cookie (rotation / initial OAuth).
 * @param {import('express').Response} res
 * @param {string} refreshToken - Raw refresh JWT.
 * @returns {void}
 */
export function setRefreshTokenCookie(res, refreshToken) {
	const maxAgeMs = getRefreshTokenTtlSeconds() * 1000;
	res.cookie(getRefreshCookieName(), refreshToken, {
		...refreshCookieBaseOptions(),
		maxAge: maxAgeMs
	});
}

/**
 * Clears the refresh cookie (e.g. sign-out).
 * @param {import('express').Response} res
 * @returns {void}
 */
export function clearRefreshTokenCookie(res) {
	res.clearCookie(getRefreshCookieName(), refreshCookieBaseOptions());
}

/**
 * @param {import('express').Request} req
 * @returns {string | undefined}
 */
export function getRefreshTokenFromCookie(req) {
	const name = getRefreshCookieName();
	const value = req.cookies?.[name];

	return typeof value === 'string' ? value : undefined;
}
