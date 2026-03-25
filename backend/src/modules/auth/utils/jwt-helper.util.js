import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const JWT_ALGORITHM = 'HS256';
const JsonWebTokenError = jwt.JsonWebTokenError;

/**
 * Reads a non-empty trimmed secret from `process.env`.
 * @param {string} envKey - Environment variable name (e.g. `JWT_SESSION_SECRET`).
 * @returns {string} Trimmed secret value.
 * @throws {Error} When the variable is missing, empty, or whitespace-only.
 */
function requireEnvSecret(envKey) {
	const raw = process.env[envKey];
	if (!raw?.trim()) {
		throw new Error(`${envKey} is not set`);
	}
	return raw.trim();
}

/**
 * Parses a positive integer from `process.env[envKey]`; invalid or non-positive values yield `fallback`.
 * @param {string} envKey - Environment variable name.
 * @param {number} fallback - Default when unset, NaN, ≤0, or unparsable.
 * @returns {number} Parsed seconds (or `fallback`).
 */
function parsePositiveIntEnv(envKey, fallback) {
	const parsed = Number.parseInt(process.env[envKey] ?? String(fallback), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * HMAC secret for access JWTs (`JWT_SESSION_SECRET`).
 * @returns {string}
 * @throws {Error} When `JWT_SESSION_SECRET` is not set.
 */
function getSessionSecret() {
	return requireEnvSecret('JWT_SESSION_SECRET');
}

/**
 * HMAC secret for refresh JWTs (`JWT_REFRESH_SECRET`).
 * @returns {string}
 * @throws {Error} When `JWT_REFRESH_SECRET` is not set.
 */
function getRefreshSecret() {
	return requireEnvSecret('JWT_REFRESH_SECRET');
}

/**
 * Access token TTL in seconds from `JWT_SESSION_TTL` (default 3600).
 * @returns {number}
 */
function getAccessTokenTtlSeconds() {
	return parsePositiveIntEnv('JWT_SESSION_TTL', 3600);
}

/**
 * Refresh token lifetime in seconds from `JWT_REFRESH_TTL` (default 604800).
 * @returns {number} Positive TTL in seconds.
 */
export function getRefreshTokenTtlSeconds() {
	return parsePositiveIntEnv('JWT_REFRESH_TTL', 604800);
}

/**
 * Signs a JWT with HS256 and fixed options; wraps library/config errors in a stable message.
 * @param {string} label - Fragment for errors (e.g. `'access token'`).
 * @param {import('jsonwebtoken').JwtPayload} payload - Claims object passed to `jwt.sign`.
 * @param {() => string} getSecret - Lazy loader for the signing secret.
 * @param {() => number} getTtlSeconds - Lazy loader for `expiresIn` (seconds).
 * @returns {string} Compact JWT string.
 * @throws {Error} When signing fails or `getSecret` / `getTtlSeconds` throws (e.g. missing env).
 */
function signTokenOrThrow(label, payload, getSecret, getTtlSeconds) {
	try {
		return jwt.sign(payload, getSecret(), {
			expiresIn: getTtlSeconds(),
			algorithm: JWT_ALGORITHM
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(`Failed to sign ${label}: ${message}`);
	}
}

/**
 * Verifies a JWT with HS256-only algorithms, then validates claims via `isValidPayload`.
 * Maps `jsonwebtoken` verification errors to `invalidMessage`; rethrows other errors (e.g. missing secret env).
 * @param {string} token - Raw JWT (no `Bearer ` prefix).
 * @param {() => string} getSecret - Lazy loader for the verification secret.
 * @param {string} invalidMessage - Message for bad signature, expiry, wrong `typ`, or failed predicate.
 * @param {function(import('jsonwebtoken').JwtPayload): boolean} isValidPayload - Predicate on decoded object payload.
 * @returns {import('jsonwebtoken').JwtPayload} Verified payload.
 * @throws {Error} With `invalidMessage` when verification or validation fails for JWT reasons; otherwise propagates.
 */
function verifyTypedToken(token, getSecret, invalidMessage, isValidPayload) {
	try {
		const payload = jwt.verify(token, getSecret(), {
			algorithms: [JWT_ALGORITHM]
		});
		if (typeof payload === 'string' || !isValidPayload(payload)) {
			throw new Error(invalidMessage);
		}
		return payload;
	} catch (error) {
		if (error instanceof JsonWebTokenError) {
			throw new Error(invalidMessage);
		}
		throw error;
	}
}

/**
 * Issues a short-lived access JWT. Payload: `{ typ: 'access', sub: connectionId }`.
 * @param {import('mongoose').Types.ObjectId | string} connectionId - Mongo id of `AirtableConnection`.
 * @returns {string} Signed JWT.
 * @throws {Error} When signing fails or secrets/TTL are misconfigured.
 */
export function signAccessToken(connectionId) {
	return signTokenOrThrow(
		'access token',
		{ typ: 'access', sub: String(connectionId) },
		getSessionSecret,
		getAccessTokenTtlSeconds
	);
}

/**
 * Issues a long-lived refresh JWT. Payload: `{ typ: 'refresh', sub: connectionId, jti }`.
 * @param {import('mongoose').Types.ObjectId | string} connectionId - Mongo id of `AirtableConnection`.
 * @param {string} jti - Unique session id stored in `auth_refresh_sessions`.
 * @returns {string} Signed JWT.
 * @throws {Error} When signing fails or secrets/TTL are misconfigured.
 */
export function signRefreshToken(connectionId, jti) {
	return signTokenOrThrow(
		'refresh token',
		{ typ: 'refresh', sub: String(connectionId), jti },
		getRefreshSecret,
		getRefreshTokenTtlSeconds
	);
}

/**
 * Verifies an access JWT and returns the payload.
 * @param {string} token - Raw Bearer token (without the `Bearer ` prefix).
 * @returns {import('jsonwebtoken').JwtPayload} Verified payload with `typ` and `sub`.
 * @throws {Error} When the token is invalid, expired, or not an access token.
 */
export function verifyAccessToken(token) {
	return verifyTypedToken(token, getSessionSecret, 'Invalid access token', (p) => p.typ === 'access' && !!p.sub);
}

/**
 * Verifies a refresh JWT and returns the payload.
 * @param {string} token - Raw refresh JWT string.
 * @returns {import('jsonwebtoken').JwtPayload} Verified payload with `typ`, `sub`, and `jti`.
 * @throws {Error} When the token is invalid, expired, or not a refresh token.
 */
export function verifyRefreshToken(token) {
	return verifyTypedToken(token, getRefreshSecret, 'Invalid refresh token', (p) => p.typ === 'refresh' && !!p.sub && !!p.jti);
}

/**
 * Generates a new `jti` for a refresh session row (`auth_refresh_sessions`).
 * @returns {string} UUID v4.
 */
export function generateRefreshTokenJti() {
	return randomUUID();
}
