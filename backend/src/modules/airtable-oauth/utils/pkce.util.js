import { createHash, randomBytes } from 'node:crypto';

/**
 * Generates a random OAuth2 `state` parameter (opaque anti-CSRF token).
 * @returns {string}
 */
export function generateOauthStateString() {
	return randomBytes(24).toString('hex');
}

/**
 * Generates a PKCE code verifier (RFC 7636: 43–128 URL-safe characters).
 * @returns {string}
 */
export function generateCodeVerifierString() {
	return randomBytes(32).toString('base64url');
}

/**
 * Derives the PKCE `code_challenge` (S256) from a verifier.
 * @param {string} codeVerifier - PKCE code verifier.
 * @returns {string} Base64url-encoded SHA-256 of the verifier.
 */
export function generateCodeChallengeString(codeVerifier) {
	return createHash('sha256').update(codeVerifier).digest('base64url');
}
