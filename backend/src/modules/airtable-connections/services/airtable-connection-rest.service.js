import { refreshAirtableTokens } from '../../airtable-oauth/services/airtable-oauth-client.service.js';
import {
	findConnectionLeanById as findConnectionLeanByIdInDb,
	updateConnectionTokens,
	upsertConnectionForAirtableUser
} from './airtable-connection-db.service.js';

/**
 * Resolves Airtable user id from a whoami-style JSON payload (shape may vary).
 * @param {Record<string, unknown>} who - Parsed whoami response body.
 * @returns {string | null}
 */
function resolveAirtableUserIdFromWhoAmI(who) {
	if (typeof who.id === 'string') return who.id;
	if (typeof who.userId === 'string') return who.userId;

	const user = who.user;
	if (user && typeof user === 'object' && user !== null && typeof user.id === 'string') {
		return user.id;
	}

	return null;
}

/**
 * Creates or updates a connection from an OAuth token response and whoami payload.
 * @param {Record<string, unknown>} tokenJson - Parsed token endpoint JSON (`access_token`, `refresh_token`, `expires_in`, `scope`).
 * @param {{ id?: string, userId?: string, email?: string, user?: { id?: string } }} who - Parsed whoami JSON.
 * @returns {Promise<import('mongoose').Document | null>}
 * @throws {Error} When whoami has no user id or `access_token` is missing.
 */
export async function upsertConnectionFromOAuth(tokenJson, who) {
	const airtableUserId = resolveAirtableUserIdFromWhoAmI(who);
	if (!airtableUserId) throw new Error('whoami response has no user id');

	const access_token = tokenJson.access_token;
	const refresh_token = tokenJson.refresh_token;
	const expires_in = tokenJson.expires_in;
	const scope = tokenJson.scope;

	if (typeof access_token !== 'string') {
		throw new Error('token response missing access_token');
	}
	const accessTokenExpiresAt = expires_in != null ? new Date(Date.now() + Number(expires_in) * 1000) : undefined;
	const scopeStr = typeof scope === 'string' ? scope : undefined;

	return upsertConnectionForAirtableUser(airtableUserId, {
		accessToken: access_token,
		refreshToken: refresh_token,
		accessTokenExpiresAt,
		scope: scopeStr,
		airtableUserEmail: who.email
	});
}

/**
 * Returns a valid Airtable access token for a connection, refreshing if expired.
 * @param {string} connectionId - Hex ObjectId string.
 * @returns {Promise<string>} Valid Airtable access token.
 * @throws {Error} When connection is missing or token refresh fails.
 */
export async function getValidAccessToken(connectionId) {
	const conn = await findConnectionLeanByIdInDb(connectionId, 'accessToken refreshToken accessTokenExpiresAt');
	if (!conn) throw new Error('Connection not found');

	const expiresAt = conn.accessTokenExpiresAt ? new Date(conn.accessTokenExpiresAt) : null;
	const isExpired = !expiresAt || expiresAt.getTime() <= Date.now();

	if (!isExpired) return conn.accessToken;

	if (!conn.refreshToken) throw new Error('No refresh token available');

	const tokenJson = await refreshAirtableTokens(conn.refreshToken);
	const newAccessToken = tokenJson.access_token;
	if (typeof newAccessToken !== 'string') throw new Error('Refresh response missing access_token');

	const newExpiresAt = tokenJson.expires_in != null ? new Date(Date.now() + Number(tokenJson.expires_in) * 1000) : undefined;

	await updateConnectionTokens(connectionId, {
		accessToken: newAccessToken,
		refreshToken: tokenJson.refresh_token ?? conn.refreshToken,
		accessTokenExpiresAt: newExpiresAt
	});

	return newAccessToken;
}

/**
 * Loads a connection by Mongo id with selected fields (lean). Delegates to the DB layer.
 * @param {string} connectionId - Hex ObjectId string.
 * @param {string} select - Mongoose select expression.
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function findConnectionLeanById(connectionId, select) {
	return findConnectionLeanByIdInDb(connectionId, select);
}
