import { mapActivityToDocs } from '../mappers/airtable-revision.mapper.js';
import { findCookiesForConnection } from './airtable-cookie-db.service.js';
import { replaceRevisionsForConnection } from './airtable-revision-db.service.js';
import { findTablesForConnection } from '../../airtable-tables/services/airtable-table-db.service.js';
import { findRecordsForConnection } from '../../airtable-records/services/airtable-record-db.service.js';
import {
	destroyScraperContext,
	fetchRevisionHistoryBatch,
	resolveScraperHandle,
	createFullScraperHandle
} from './airtable-revision-client.service.js';

const AIRTABLE_ORIGIN = 'https://airtable.com';
const BATCH_SIZE = 15;
const INTER_BATCH_DELAY_MS = 500;
const TRACKED_FIELD_NAMES = ['Assignee', 'Status'];
const TRACKED_CHANGE_TYPES = ['diff', 'updated', 'cleared'];

/**
 * Scrapes revision history for every record in the connection and stores results in MongoDB.
 * Tries a fast cached context first; falls back to full SPA navigation when stale.
 * @param {string} connectionId
 * @returns {Promise<number>} Total number of stored revisions.
 */
export async function syncRevisionsForConnection(connectionId) {
	const cookieRecord = await findCookiesForConnection(connectionId);
	if (!cookieRecord?.cookies?.length) {
		throw new Error('No Airtable session cookies found — please log in via the scraper first');
	}

	const records = await findRecordsForConnection(connectionId);
	if (records.length === 0) return 0;

	const tables = await findTablesForConnection(connectionId);
	const viewByTable = new Map();
	for (const table of tables) {
		const firstView = table.views?.[0];
		if (firstView) viewByTable.set(table.airtableTableId, firstView.airtableViewId);
	}

	const firstRecord = records[0];
	const firstViewId = viewByTable.get(firstRecord.airtableTableId);
	if (!firstViewId) throw new Error('No view found for the first table — cannot establish browser context');

	const seedUrl = `${AIRTABLE_ORIGIN}/${firstRecord.airtableBaseId}/${firstRecord.airtableTableId}/${firstViewId}/${firstRecord.airtableRecordId}`;

	let handle = await resolveScraperHandle(connectionId, cookieRecord, seedUrl);

	try {
		const allDocs = [];

		for (let batchStart = 0; batchStart < records.length; batchStart += BATCH_SIZE) {
			const batchIds = records.slice(batchStart, batchStart + BATCH_SIZE).map(record => record.airtableRecordId);

			let results = await fetchRevisionHistoryBatch(handle.page, handle.fetchHeaders, handle.secretSocketId, batchIds);

			if (batchStart === 0 && handle.cached && results.every(result => result.error)) {
				await destroyScraperContext(handle);
				handle = await createFullScraperHandle(connectionId, cookieRecord.cookies, seedUrl);
				results = await fetchRevisionHistoryBatch(handle.page, handle.fetchHeaders, handle.secretSocketId, batchIds);
			}

			for (const result of results) {
				if (result.error || !result.activities?.length) continue;
				for (const activity of result.activities) {
					allDocs.push(...mapActivityToDocs(connectionId, result.recordId, activity, TRACKED_FIELD_NAMES, TRACKED_CHANGE_TYPES));
				}
			}

			if (batchStart + BATCH_SIZE < records.length) {
				await new Promise(resolve => setTimeout(resolve, INTER_BATCH_DELAY_MS));
			}
		}

		const stored = await replaceRevisionsForConnection(connectionId, allDocs);
		return stored.length;
	} finally {
		await destroyScraperContext(handle);
	}
}
