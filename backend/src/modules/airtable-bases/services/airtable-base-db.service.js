import { AirtableBase } from '../models/airtable-base.model.js';
import { mapBaseToDoc } from '../mappers/airtable-base.mapper.js';

/**
 * Replaces all stored bases for a connection with a fresh list (delete + bulk insert).
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<{ id: string, name: string, permissionLevel?: string }>} bases - Raw base objects from the Airtable API.
 * @returns {Promise<import('mongoose').Document[]>} Inserted documents.
 */
export async function replaceBasesForConnection(connectionId, bases) {
	await AirtableBase.deleteMany({ connectionId });

	if (bases.length === 0) return [];

	const docs = bases.map(base => mapBaseToDoc(connectionId, base));

	return AirtableBase.insertMany(docs);
}

/**
 * Returns all bases for a connection as lean documents.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function findBasesForConnection(connectionId) {
	return AirtableBase.find({ connectionId }).select('airtableBaseId name permissionLevel').lean();
}
