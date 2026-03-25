/** Backend API paths for Airtable endpoints (relative to apiBaseUrl). */
export const AIRTABLE_API_PATHS = {
	BASES: '/airtable/bases',
	SYNC_BASES: '/airtable/bases/sync',
	TABLES: '/airtable/tables',
	SYNC_TABLES: '/airtable/tables/sync',
	RECORDS: '/airtable/records',
	SYNC_RECORDS: '/airtable/records/sync',
	SCRAPER_LOGIN: '/scraper/auth/login',
	SCRAPER_MFA: '/scraper/auth/mfa',
	SCRAPER_COOKIE_STATUS: '/scraper/auth/cookies/status',
	SYNC_REVISIONS: '/scraper/revisions/sync',
	REVISIONS: '/scraper/revisions',
	SYNC_USERS: '/scraper/users/sync',
	USERS: '/scraper/users'
} as const;
