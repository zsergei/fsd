/**
 * Maps a raw Airtable API table object to a Mongoose document shape.
 * @param {string} connectionId
 * @param {string} baseId
 * @param {Record<string, unknown>} table - Raw table from the Airtable API.
 */
export function mapTableToDoc(connectionId, baseId, table) {
	return {
		connectionId,
		airtableBaseId: baseId,
		airtableTableId: table.id,
		name: table.name,
		description: table.description ?? '',
		primaryFieldId: table.primaryFieldId,
		fields: (table.fields ?? []).map(field => ({
			airtableFieldId: field.id,
			name: field.name,
			type: field.type,
			description: field.description ?? ''
		})),
		views: (table.views ?? []).map(view => ({
			airtableViewId: view.id,
			name: view.name,
			type: view.type
		}))
	};
}
