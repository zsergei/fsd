import { AirtableRevision } from '../models/airtable-revision.model.js';

/**
 * Replaces all stored revisions for a connection with the given documents.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<Record<string, unknown>>} revisionDocs - Pre-mapped flat documents.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
export async function replaceRevisionsForConnection(connectionId, revisionDocs) {
	await AirtableRevision.deleteMany({ connectionId });

	if (revisionDocs.length === 0) return [];

	return AirtableRevision.insertMany(revisionDocs);
}

/**
 * Returns stored revisions for a connection.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function findRevisionsForConnection(connectionId) {
	return AirtableRevision.find({ connectionId })
		.select('uuid issueId columnType oldValue newValue createdDate authoredBy')
		.sort({ createdDate: -1 })
		.lean();
}
