import { AuthRefreshSession } from '../models/auth-refresh-session.model.js';

/**
 * Inserts a new refresh-session row for JWT rotation tracking.
 * @param {object} params
 * @param {string} params.jti - Refresh token `jti` claim.
 * @param {import('mongoose').Types.ObjectId | string} params.connectionId - Linked `AirtableConnection` id.
 * @param {Date} params.expiresAt - Session expiry (TTL aligned with refresh JWT).
 * @param {boolean} [params.revoked=false]
 * @returns {Promise<import('mongoose').Document>}
 */
export async function createRefreshSessionRow({ jti, connectionId, expiresAt, revoked = false }) {
	return AuthRefreshSession.create({
		jti,
		connectionId,
		expiresAt,
		revoked
	});
}

/**
 * Loads a non-revoked refresh session by `jti` and connection id.
 * @param {string} jti
 * @param {string} connectionId - `sub` from refresh JWT (ObjectId string).
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function findActiveRefreshSession(jti, connectionId) {
	return AuthRefreshSession.findOne({
		jti,
		connectionId,
		revoked: false
	});
}

/**
 * Marks a session document as revoked and persists it.
 * @param {import('mongoose').Document} session - Mutable session document from Mongoose.
 * @returns {Promise<void>}
 */
export async function markRefreshSessionRevoked(session) {
	session.revoked = true;
	await session.save();
}

/**
 * Revokes every active (non-revoked) refresh session for a connection (logout from all devices).
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<void>}
 */
export async function revokeAllConnectionSessions(connectionId) {
	await AuthRefreshSession.updateMany({ connectionId, revoked: false }, { revoked: true });
}
