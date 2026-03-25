import type { CollectionId } from './data-grid.types';

export const COLLECTIONS: readonly CollectionId[] = [
	'airtable_bases',
	'airtable_records',
	'airtable_revisions',
	'airtable_tables',
	'airtable_users'
];

export const EXCLUDED_GRID_KEYS = new Set(['_id', '__v', 'connectionId']);
