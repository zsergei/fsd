/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * Handles both standard base64 and base64url encoding.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = atob(base64);

		return JSON.parse(json) as Record<string, unknown>;
	} catch {
		return null;
	}
}

/**
 * Returns `true` when the token is missing, malformed, or its `exp` claim
 * is within `offsetSeconds` of the current time (default 30 s safety buffer).
 */
export function isTokenExpired(token: string, offsetSeconds = 30): boolean {
	const payload = decodeJwtPayload(token);
	if (!payload || typeof payload['exp'] !== 'number') return true;

	return Date.now() >= (payload['exp'] - offsetSeconds) * 1000;
}
