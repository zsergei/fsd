import { fetchAllBases } from './airtable-base-client.service.js';
import { replaceBasesForConnection } from './airtable-base-db.service.js';
import { getValidAccessToken } from '../../airtable-connections/services/airtable-connection-rest.service.js';

/**
 * Syncs bases from the Airtable Meta API into MongoDB for a given connection.
 * Fetches all pages, replaces stored bases, and returns the fresh list.
 * @param {string} connectionId - Hex ObjectId string (from JWT `sub`).
 * @returns {Promise<import('mongoose').Document[]>} Stored base documents.
 */
export async function syncBasesForConnection(connectionId) {
	const accessToken = await getValidAccessToken(connectionId);
	const bases = await fetchAllBases(accessToken);

	return replaceBasesForConnection(connectionId, bases);
}
