import { AirtableTable } from '../models/airtable-table.model.js';
import { mapTableToDoc } from '../mappers/airtable-table.mapper.js';

/**
 * Replaces all stored tables for a connection with a fresh list (delete + bulk insert).
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<{ baseId: string, tables: Array<Record<string, unknown>> }>} baseTables - Tables grouped by base.
 * @returns {Promise<import('mongoose').Document[]>} Inserted documents.
 */
export async function replaceTablesForConnection(connectionId, baseTables) {
	await AirtableTable.deleteMany({ connectionId });

	const docs = baseTables.flatMap(({ baseId, tables }) => tables.map(table => mapTableToDoc(connectionId, baseId, table)));

	if (docs.length === 0) return [];

	return AirtableTable.insertMany(docs);
}

/**
 * Returns tables for a connection as lean documents, optionally filtered by base.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {string} [baseId] - Optional Airtable base id filter.
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function findTablesForConnection(connectionId, baseId) {
	const filter = { connectionId };
	if (baseId) filter.airtableBaseId = baseId;

	return AirtableTable.find(filter).select('airtableBaseId airtableTableId name description primaryFieldId fields views').lean();
}
