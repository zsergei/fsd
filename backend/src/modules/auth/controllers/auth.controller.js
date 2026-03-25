import { clearRefreshTokenCookie, getRefreshTokenFromCookie, setRefreshTokenCookie } from '../utils/refresh-cookie.util.js';
import { getMePayloadForConnection, revokeSessionsFromRefreshToken, rotateRefreshToken } from '../services/auth-rest.service.js';

/**
 * Exchanges refresh JWT from httpOnly cookie for a new access token; rotates refresh in cookie.
 * @type {import('express').RequestHandler}
 */
export async function postRefresh(req, res) {
	try {
		const tokens = await rotateRefreshToken(getRefreshTokenFromCookie(req));
		setRefreshTokenCookie(res, tokens.refreshToken);
		res.json({ accessToken: tokens.accessToken });
	} catch {
		res.status(401).json({ error: 'Refresh token missing or invalid' });
	}
}

/**
 * Returns the current session's Airtable connection summary (requires `requireAccessJwt` middleware).
 * @type {import('express').RequestHandler}
 */
export async function getMe(req, res) {
	const payload = await getMePayloadForConnection(req.connectionId);
	if (!payload) {
		res.status(404).json({ error: 'Connection not found' });
		return;
	}
	res.json(payload);
}

/**
 * Revokes all refresh sessions for the connection and clears the refresh cookie.
 * Best-effort: always returns 204 so the client can proceed with local cleanup.
 * @type {import('express').RequestHandler}
 */
export async function postLogout(req, res) {
	await revokeSessionsFromRefreshToken(getRefreshTokenFromCookie(req)).catch(() => {});
	clearRefreshTokenCookie(res);
	res.status(204).end();
}
