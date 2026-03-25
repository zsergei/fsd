const AIRTABLE_META_BASES_URL = 'https://api.airtable.com/v0/meta/bases';

/**
 * Fetches all bases from the Airtable Meta API, handling offset-based pagination.
 * @param {string} accessToken - Valid Airtable OAuth access token.
 * @returns {Promise<Array<{ id: string, name: string, permissionLevel: string }>>} Flat array of base objects.
 * @throws {Error} On non-OK HTTP response from Airtable.
 */
export async function fetchAllBases(accessToken) {
	const bases = [];
	let offset;

	do {
		const url = new URL(AIRTABLE_META_BASES_URL);
		if (offset) url.searchParams.set('offset', offset);

		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});

		const data = await res.json();
		if (!res.ok) {
			const msg = data.error?.message || data.error || 'Failed to fetch bases';
			throw new Error(msg);
		}

		bases.push(...(data.bases ?? []));
		offset = data.offset;
	} while (offset);

	return bases;
}
