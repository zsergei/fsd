const AIRTABLE_USER_ID_PREFIX = 'usr';

/**
 * Detects whether a value is an Airtable collaborator object (`{ id: 'usrXXX', ... }`).
 * @param {unknown} value
 * @returns {value is { id: string }}
 */
function isCollaborator(value) {
	return (
		value !== null &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		typeof (/** @type {any} */ (value).id) === 'string' &&
		/** @type {any} */ (value).id.startsWith(AIRTABLE_USER_ID_PREFIX)
	);
}

/**
 * Resolves a field value to a flat-storage form:
 * - Collaborator objects → their `id` string.
 * - Arrays of collaborators → array of `id` strings.
 * - Everything else is kept as-is.
 * @param {unknown} value
 * @returns {unknown}
 */
function flattenFieldValue(value) {
	if (isCollaborator(value)) return /** @type {{ id: string }} */ (value).id;

	if (Array.isArray(value)) {
		return value.map(item => (isCollaborator(item) ? item.id : item));
	}

	return value;
}

/**
 * Maps a raw Airtable API record to a flat Mongoose document.
 * All entries from `record.fields` are promoted to top-level properties
 * (collaborator objects are reduced to their `id`).
 * @param {string} connectionId
 * @param {string} baseId
 * @param {string} tableId
 * @param {{ id: string, fields: Record<string, unknown>, createdTime?: string }} record
 */
export function mapRecordToDoc(connectionId, baseId, tableId, record) {
	const doc = {
		connectionId,
		airtableBaseId: baseId,
		airtableTableId: tableId,
		airtableRecordId: record.id,
		airtableCreatedTime: record.createdTime ? new Date(record.createdTime) : undefined
	};

	for (const [key, value] of Object.entries(record.fields ?? {})) {
		doc[key] = flattenFieldValue(value);
	}

	return doc;
}
