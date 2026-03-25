const AIRTABLE_META_URL = 'https://api.airtable.com/v0/meta/bases';

/**
 * Fetches all tables for a single base from the Airtable Meta API.
 * @param {string} accessToken - Valid Airtable OAuth access token.
 * @param {string} baseId - Airtable base id (e.g. `appXXX`).
 * @returns {Promise<Array<Record<string, unknown>>>} Array of table objects with fields/views.
 * @throws {Error} On non-OK HTTP response from Airtable.
 */
export async function fetchTablesForBase(accessToken, baseId) {
	const res = await fetch(`${AIRTABLE_META_URL}/${baseId}/tables`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	const data = await res.json();
	if (!res.ok) {
		const msg = data.error?.message || data.error || 'Failed to fetch tables';
		throw new Error(msg);
	}

	return data.tables ?? [];
}
