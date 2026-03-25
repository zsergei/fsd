import { replaceUsersForConnection } from './airtable-user-db.service.js';
import { mapCollaboratorToDoc } from '../mappers/airtable-user.mapper.js';
import { findCookiesForConnection } from './airtable-cookie-db.service.js';
import { findBasesForConnection } from '../../airtable-bases/services/airtable-base-db.service.js';
import { findTablesForConnection } from '../../airtable-tables/services/airtable-table-db.service.js';
import { findRecordsForConnection } from '../../airtable-records/services/airtable-record-db.service.js';
import {
	destroyScraperContext,
	fetchCollaborators,
	resolveScraperHandle,
	createFullScraperHandle
} from './airtable-revision-client.service.js';

const AIRTABLE_ORIGIN = 'https://airtable.com';

/**
 * Scrapes collaborators for the first synced base and stores them in MongoDB.
 * Reuses the same Playwright context strategy as revision scraping (fast/full).
 * @param {string} connectionId
 * @returns {Promise<number>} Total number of stored users.
 */
export async function syncUsersForConnection(connectionId) {
	const cookieRecord = await findCookiesForConnection(connectionId);
	if (!cookieRecord?.cookies?.length) {
		throw new Error('No Airtable session cookies found — please log in via the scraper first');
	}

	const bases = await findBasesForConnection(connectionId);
	if (bases.length === 0) throw new Error('No synced bases found — run base sync first');

	const baseId = bases[0].airtableBaseId;

	const tables = await findTablesForConnection(connectionId);
	const records = await findRecordsForConnection(connectionId);
	if (records.length === 0 || tables.length === 0) {
		throw new Error('No synced records/tables — run full sync first');
	}

	const firstView = tables[0].views?.[0];
	if (!firstView) throw new Error('No view found — cannot establish browser context');

	const seedUrl = `${AIRTABLE_ORIGIN}/${records[0].airtableBaseId}/${records[0].airtableTableId}/${firstView.airtableViewId}/${records[0].airtableRecordId}`;
	let handle = await resolveScraperHandle(connectionId, cookieRecord, seedUrl);

	try {
		let result = await fetchCollaborators(handle.page, handle.fetchHeaders, handle.secretSocketId, baseId);

		if (result.error && handle.cached) {
			await destroyScraperContext(handle);
			handle = await createFullScraperHandle(connectionId, cookieRecord.cookies, seedUrl);
			result = await fetchCollaborators(handle.page, handle.fetchHeaders, handle.secretSocketId, baseId);
		}

		if (result.error) {
			throw new Error(`Collaborators fetch failed: ${result.status} — ${result.message}`);
		}

		const data = result.data ?? result;
		const allDocs = [];

		for (const collaborator of data.collaborators ?? []) {
			allDocs.push(mapCollaboratorToDoc(connectionId, collaborator, 'collaborator'));
		}

		for (const collaborator of data.workspaceCollaborators ?? []) {
			if (!allDocs.some(doc => doc.airtableUserId === collaborator.id)) {
				allDocs.push(mapCollaboratorToDoc(connectionId, collaborator, 'workspaceCollaborator'));
			}
		}

		const stored = await replaceUsersForConnection(connectionId, allDocs);
		return stored.length;
	} finally {
		await destroyScraperContext(handle);
	}
}
