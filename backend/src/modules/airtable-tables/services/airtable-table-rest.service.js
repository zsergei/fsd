import { fetchTablesForBase } from './airtable-table-client.service.js';
import { replaceTablesForConnection } from './airtable-table-db.service.js';
import { findBasesForConnection } from '../../airtable-bases/services/airtable-base-db.service.js';
import { getValidAccessToken } from '../../airtable-connections/services/airtable-connection-rest.service.js';

/**
 * Syncs tables for every stored base of a connection from the Airtable Meta API into MongoDB.
 * @param {string} connectionId - Hex ObjectId string (from JWT `sub`).
 * @returns {Promise<import('mongoose').Document[]>} Stored table documents.
 */
export async function syncTablesForConnection(connectionId) {
	const accessToken = await getValidAccessToken(connectionId);
	const bases = await findBasesForConnection(connectionId);

	const baseTables = await Promise.all(
		bases.map(async base => ({
			baseId: base.airtableBaseId,
			tables: await fetchTablesForBase(accessToken, base.airtableBaseId)
		}))
	);

	return replaceTablesForConnection(connectionId, baseTables);
}
