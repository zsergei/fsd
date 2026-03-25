const AIRTABLE_DATA_URL = 'https://api.airtable.com/v0';

/**
 * Fetches all records for a single table from the Airtable Data API, handling offset-based pagination.
 * @param {string} accessToken - Valid Airtable OAuth access token.
 * @param {string} baseId - Airtable base id (e.g. `appXXX`).
 * @param {string} tableId - Airtable table id (e.g. `tblXXX`).
 * @returns {Promise<Array<{ id: string, fields: Record<string, unknown>, createdTime: string }>>} Flat array of record objects.
 * @throws {Error} On non-OK HTTP response from Airtable.
 */
export async function fetchAllRecordsForTable(accessToken, baseId, tableId) {
	const records = [];
	let offset;

	do {
		const url = new URL(`${AIRTABLE_DATA_URL}/${baseId}/${tableId}`);
		url.searchParams.set('pageSize', '100');
		if (offset) url.searchParams.set('offset', offset);

		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});

		const data = await response.json();
		if (!response.ok) {
			const message = data.error?.message || data.error || 'Failed to fetch records';
			throw new Error(message);
		}

		records.push(...(data.records ?? []));
		offset = data.offset;
	} while (offset);

	return records;
}
