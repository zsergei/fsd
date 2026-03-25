import { AirtableCookie } from '../models/airtable-cookie.model.js';

/**
 * Stores or updates Airtable session cookies for a connection.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<Record<string, unknown>>} cookies - Serialized cookie array from Playwright.
 * @param {Date} expiresAt - Approximate cookie expiry.
 * @returns {Promise<import('mongoose').Document>}
 */
export async function upsertCookiesForConnection(connectionId, cookies, expiresAt) {
	return AirtableCookie.findOneAndUpdate(
		{ connectionId },
		{ $set: { cookies, expiresAt, validatedAt: new Date() } },
		{ upsert: true, returnDocument: 'after' }
	);
}

/**
 * Returns stored cookies for a connection as a lean document.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function findCookiesForConnection(connectionId) {
	return AirtableCookie.findOne({ connectionId }).lean();
}

/**
 * Removes stored cookies for a connection.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<import('mongoose').mongo.DeleteResult>}
 */
export async function deleteCookiesForConnection(connectionId) {
	return AirtableCookie.deleteOne({ connectionId });
}

/**
 * Persists captured Playwright request headers and secretSocketId for fast context reuse.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Record<string, string>} fetchHeaders
 * @param {string} secretSocketId
 */
export async function updateCachedScraperContext(connectionId, fetchHeaders, secretSocketId) {
	return AirtableCookie.updateOne(
		{ connectionId },
		{ $set: { cachedFetchHeaders: fetchHeaders, cachedSecretSocketId: secretSocketId } }
	);
}
