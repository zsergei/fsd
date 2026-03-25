import { findConnectionLeanById } from '../../airtable-connections/services/airtable-connection-rest.service.js';
import { createRefreshSessionRow, findActiveRefreshSession, markRefreshSessionRevoked, revokeAllConnectionSessions } from './auth-db.service.js';
import {
	generateRefreshTokenJti,
	getRefreshTokenTtlSeconds,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken
} from '../utils/jwt-helper.util.js';

/**
 * Creates a refresh session row and returns signed access + refresh JWTs for a connection.
 * @param {import('mongoose').Types.ObjectId | string} connectionId - Linked `AirtableConnection` id.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export async function issueTokenPair(connectionId) {
	const jti = generateRefreshTokenJti();
	const expiresAt = new Date(Date.now() + getRefreshTokenTtlSeconds() * 1000);

	await createRefreshSessionRow({
		jti,
		connectionId,
		expiresAt,
		revoked: false
	});

	return {
		accessToken: signAccessToken(connectionId),
		refreshToken: signRefreshToken(connectionId, jti)
	};
}

/**
 * Validates a refresh token, revokes its session row, and issues a new token pair (rotation).
 * @param {string} refreshTokenString - Raw refresh JWT from the client.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 * @throws {Error} When the JWT is invalid or the session is not usable.
 */
export async function rotateRefreshToken(refreshTokenString) {
	const payload = verifyRefreshToken(refreshTokenString);
	const session = await findActiveRefreshSession(payload.jti, payload.sub);
	if (!session || session.expiresAt <= new Date()) {
		throw new Error('Refresh session invalid');
	}

	await markRefreshSessionRevoked(session);

	return issueTokenPair(payload.sub);
}

/**
 * Revokes all active refresh sessions for the connection identified by the refresh JWT.
 * Silently ignores invalid/expired tokens so logout never throws.
 * @param {string | undefined} refreshTokenString - Raw refresh JWT from cookie (may be absent).
 */
export async function revokeSessionsFromRefreshToken(refreshTokenString) {
	if (!refreshTokenString) return;
	const { sub: connectionId } = verifyRefreshToken(refreshTokenString);
	await revokeAllConnectionSessions(connectionId);
}

/**
 * Builds the `/auth/me` JSON body for a connection id.
 * @param {string} connectionId - From verified access JWT `sub`.
 * @returns {Promise<{ connectionId: string, airtableUserId: string | null, airtableUserEmail: string | null } | null>}
 */
export async function getMePayloadForConnection(connectionId) {
	const doc = await findConnectionLeanById(connectionId, 'airtableUserId airtableUserEmail');
	if (!doc) return null;

	return {
		connectionId,
		airtableUserId: doc.airtableUserId ?? null,
		airtableUserEmail: doc.airtableUserEmail ?? null
	};
}
