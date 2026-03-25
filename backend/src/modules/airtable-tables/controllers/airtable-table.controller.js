import { findTablesForConnection } from '../services/airtable-table-db.service.js';
import { syncTablesForConnection } from '../services/airtable-table-rest.service.js';

/**
 * Syncs tables for all bases from Airtable API into MongoDB and returns the fresh list.
 * @type {import('express').RequestHandler}
 */
export async function postSyncTables(req, res) {
	try {
		const tables = await syncTablesForConnection(req.connectionId);
		res.json({ tables });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Sync failed';
		res.status(502).json({ error: message });
	}
}

/**
 * Returns stored tables for the current connection from MongoDB.
 * Supports optional `?baseId=` query filter.
 * @type {import('express').RequestHandler}
 */
export async function getTables(req, res) {
	const tables = await findTablesForConnection(req.connectionId, req.query.baseId);
	res.json({ tables });
}
