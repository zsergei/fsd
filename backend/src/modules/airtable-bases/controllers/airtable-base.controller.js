import { findBasesForConnection } from '../services/airtable-base-db.service.js';
import { syncBasesForConnection } from '../services/airtable-base-rest.service.js';

/**
 * Syncs bases from Airtable API into MongoDB and returns the fresh list.
 * @type {import('express').RequestHandler}
 */
export async function postSyncBases(req, res) {
	try {
		const bases = await syncBasesForConnection(req.connectionId);
		res.json({ bases });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Sync failed';
		res.status(502).json({ error: message });
	}
}

/**
 * Returns stored bases for the current connection from MongoDB.
 * @type {import('express').RequestHandler}
 */
export async function getBases(req, res) {
	const bases = await findBasesForConnection(req.connectionId);
	res.json({ bases });
}
