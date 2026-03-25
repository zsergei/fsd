/**
 * Maps a raw Airtable API base object to a Mongoose document shape.
 * @param {string} connectionId
 * @param {{ id: string, name: string, permissionLevel?: string }} base - Raw base from the Airtable API.
 */
export function mapBaseToDoc(connectionId, base) {
	return {
		connectionId,
		airtableBaseId: base.id,
		name: base.name,
		permissionLevel: base.permissionLevel
	};
}
