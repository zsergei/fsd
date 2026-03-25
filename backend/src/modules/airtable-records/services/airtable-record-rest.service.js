import { fetchAllRecordsForTable } from './airtable-record-client.service.js';
import { replaceRecordsForConnection } from './airtable-record-db.service.js';
import { findTablesForConnection } from '../../airtable-tables/services/airtable-table-db.service.js';
import { getValidAccessToken } from '../../airtable-connections/services/airtable-connection-rest.service.js';

/**
 * Fetches records for all tables of a single base sequentially to respect Airtable's per-base rate limit.
 * @param {string} accessToken
 * @param {string} baseId
 * @param {Array<{ airtableTableId: string }>} tables
 * @returns {Promise<Array<{ baseId: string, tableId: string, records: Array<Record<string, unknown>> }>>}
 */
async function fetchRecordsForBase(accessToken, baseId, tables) {
	const results = [];

	for (const table of tables) {
		const records = await fetchAllRecordsForTable(accessToken, baseId, table.airtableTableId);
		results.push({ baseId, tableId: table.airtableTableId, records });
	}

	return results;
}

/**
 * Syncs records for every table of every base from the Airtable Data API into MongoDB.
 * Bases are processed in parallel; tables within each base are fetched sequentially (5 req/sec rate limit).
 * @param {string} connectionId - Hex ObjectId string (from JWT `sub`).
 * @returns {Promise<number>} Total number of stored records.
 */
export async function syncRecordsForConnection(connectionId) {
	const accessToken = await getValidAccessToken(connectionId);
	const tables = await findTablesForConnection(connectionId);

	const tablesByBase = Map.groupBy(tables, table => table.airtableBaseId);

	const nestedResults = await Promise.all(
		[...tablesByBase.entries()].map(([baseId, baseTables]) =>
			fetchRecordsForBase(accessToken, baseId, baseTables)
		)
	);

	const tableRecords = nestedResults.flat();
	const docs = await replaceRecordsForConnection(connectionId, tableRecords);

	return docs.length;
}
