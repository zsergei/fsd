import { AirtableRecord } from '../models/airtable-record.model.js';
import { mapRecordToDoc } from '../mappers/airtable-record.mapper.js';

/**
 * Replaces all stored records for a connection with a fresh list (delete + bulk insert).
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<{ baseId: string, tableId: string, records: Array<Record<string, unknown>> }>} tableRecords - Records grouped by base and table.
 * @returns {Promise<import('mongoose').Document[]>} Inserted documents.
 */
export async function replaceRecordsForConnection(connectionId, tableRecords) {
	await AirtableRecord.deleteMany({ connectionId });

	const docs = tableRecords.flatMap(({ baseId, tableId, records }) =>
		records.map(record => mapRecordToDoc(connectionId, baseId, tableId, record))
	);

	if (docs.length === 0) return [];

	return AirtableRecord.insertMany(docs);
}

/**
 * Returns records for a connection as lean documents, optionally filtered by base and/or table.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {string} [baseId] - Optional Airtable base id filter.
 * @param {string} [tableId] - Optional Airtable table id filter.
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function findRecordsForConnection(connectionId, baseId, tableId) {
	const filter = { connectionId };
	if (baseId) filter.airtableBaseId = baseId;
	if (tableId) filter.airtableTableId = tableId;

	return AirtableRecord.find(filter)
		.select('-__v')
		.lean();
}
