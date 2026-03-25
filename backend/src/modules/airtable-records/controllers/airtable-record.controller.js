import { findRecordsForConnection } from '../services/airtable-record-db.service.js';
import { syncRecordsForConnection } from '../services/airtable-record-rest.service.js';

/**
 * Syncs records for all tables from Airtable API into MongoDB and returns the count.
 * @type {import('express').RequestHandler}
 */
export async function postSyncRecords(req, res) {
	try {
		const count = await syncRecordsForConnection(req.connectionId);
		res.json({ count });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Sync failed';
		res.status(502).json({ error: message });
	}
}

/**
 * Returns stored records for the current connection from MongoDB.
 * Supports optional `?baseId=` and `?tableId=` query filters.
 * @type {import('express').RequestHandler}
 */
export async function getRecords(req, res) {
	const records = await findRecordsForConnection(req.connectionId, req.query.baseId, req.query.tableId);
	res.json({ records });
}
