import { updateCachedScraperContext } from './airtable-cookie-db.service.js';
import { launchCamoufox, solvePerimeterXIfPresent } from './airtable-scraper-browser.service.js';

const NAVIGATION_TIMEOUT_MS = 60_000;
const CAPTURE_TIMEOUT_MS = 20_000;
const PAGINATION_DELAY_MS = 200;
const REVISION_PAGE_LIMIT = 50;
const FAST_INIT_URL = 'https://airtable.com/__fast_init';
const AIRTABLE_INTERNAL_API_PREFIX = '/v0.3/';
const AIRTABLE_HOST = 'airtable.com';

/**
 * Creates a Playwright browser + context with pre-loaded Airtable cookies.
 * Navigates to a record detail page to establish session context and capture
 * request headers + secretSocketId that the Airtable SPA uses for internal API calls.
 * @param {Array<Record<string, unknown>>} cookies
 * @param {string} recordUrl - Full URL to a record detail page.
 * @returns {Promise<{ browser: import('playwright').Browser, page: import('playwright').Page, fetchHeaders: Record<string, string>, secretSocketId: string }>}
 */
export async function createScraperContext(cookies, recordUrl) {
	const browser = await launchCamoufox();
	const context = await browser.newContext();
	await context.addCookies(cookies);
	const page = await context.newPage();

	const ctxPromise = captureRequestContext(page);
	await page.goto(recordUrl, { waitUntil: 'load', timeout: NAVIGATION_TIMEOUT_MS });
	await solvePerimeterXIfPresent(page);
	const { headers, secretSocketId } = await ctxPromise;

	return { browser, page, fetchHeaders: filterHeadersForFetch(headers), secretSocketId };
}

/**
 * Creates a lightweight Playwright context that skips SPA navigation entirely.
 * Establishes the airtable.com origin via a route-intercepted dummy page so that
 * subsequent fetch calls include session cookies. Requires previously cached headers.
 * @param {Array<Record<string, unknown>>} cookies
 * @param {Record<string, string>} cachedHeaders
 * @param {string} cachedSecretSocketId
 * @returns {Promise<{ browser: import('playwright').Browser, page: import('playwright').Page, fetchHeaders: Record<string, string>, secretSocketId: string }>}
 */
export async function createFastScraperContext(cookies, cachedHeaders, cachedSecretSocketId) {
	const browser = await launchCamoufox();
	const context = await browser.newContext();
	await context.addCookies(cookies);
	const page = await context.newPage();

	await page.route(FAST_INIT_URL, route => route.fulfill({ status: 200, body: '<html></html>', contentType: 'text/html' }));
	await page.goto(FAST_INIT_URL, { waitUntil: 'load' });

	return { browser, page, fetchHeaders: cachedHeaders, secretSocketId: cachedSecretSocketId };
}

/**
 * Closes the Playwright browser associated with a scraper handle.
 * @param {{ browser: import('playwright').Browser }} handle
 * @returns {Promise<void>}
 */
export async function destroyScraperContext(handle) {
	try { await handle.browser.close(); } catch { /* noop */ }
}

/**
 * Fetches revision history for a batch of records in parallel via a single page.evaluate call.
 * Each record handles its own pagination internally. Returns an array of { recordId, activities } | { recordId, error }.
 * @param {import('playwright').Page} page
 * @param {Record<string, string>} fetchHeaders
 * @param {string} secretSocketId
 * @param {string[]} recordIds
 * @returns {Promise<Array<{ recordId: string, activities?: Array<Record<string, unknown>>, error?: string }>>}
 */
export async function fetchRevisionHistoryBatch(page, fetchHeaders, secretSocketId, recordIds) {
	return page.evaluate(
		async ({ recordIds, secretSocketId, fetchHeaders, paginationDelay, pageLimit }) => {
			async function fetchForRecord(recordId) {
				const activities = [];
				let offset = null;

				do {
					const params = JSON.stringify({
						limit: pageLimit,
						offsetV2: offset,
						shouldReturnDeserializedActivityItems: true,
						shouldIncludeRowActivityOrCommentUserObjById: true
					});

					// eslint-disable-next-line n/no-unsupported-features/node-builtins -- runs in browser context
					const requestId = crypto.randomUUID();
					let url =
						`/v0.3/row/${recordId}/readRowActivitiesAndComments` +
						`?stringifiedObjectParams=${encodeURIComponent(params)}` +
						`&requestId=${requestId}`;
					if (secretSocketId) url += `&secretSocketId=${secretSocketId}`;

					const response = await fetch(url, { credentials: 'include', headers: fetchHeaders });

					if (!response.ok) {
						return { recordId, error: `${response.status}`, activities: [] };
					}

					const result = await response.json();
					const payload = result.data ?? result;
					const orderedIds = payload.orderedActivityAndCommentIds ?? [];
					const activityMap = payload.rowActivityInfoById ?? {};
					const userMap = payload.rowActivityOrCommentUserObjById ?? {};

					for (const entry of orderedIds) {
						const actId = entry?.id ?? entry;
						const info = activityMap[actId];
						if (info) {
							activities.push({ ...info, id: actId, _userMap: userMap });
						}
					}

					offset = payload.offsetV2 ?? null;
					if (offset) {
						await new Promise(resolve => setTimeout(resolve, paginationDelay));
					}
				} while (offset);

				return { recordId, activities };
			}

			return Promise.all(recordIds.map(fetchForRecord));
		},
		{ recordIds, secretSocketId, fetchHeaders, paginationDelay: PAGINATION_DELAY_MS, pageLimit: REVISION_PAGE_LIMIT }
	);
}

/**
 * Fetches all collaborators for a base via the internal share dialog endpoint.
 * Returns the full response data including collaborators and workspaceCollaborators.
 * @param {import('playwright').Page} page
 * @param {Record<string, string>} fetchHeaders
 * @param {string} secretSocketId
 * @param {string} baseId
 * @returns {Promise<Record<string, unknown>>}
 */
export async function fetchCollaborators(page, fetchHeaders, secretSocketId, baseId) {
	return page.evaluate(
		async ({ baseId, secretSocketId, fetchHeaders }) => {
			const params = encodeURIComponent('{}');
			// eslint-disable-next-line n/no-unsupported-features/node-builtins -- runs in browser context
			const requestId = crypto.randomUUID();
			let url =
				`/v0.3/application/${baseId}/readCollaboratorsForUnifiedShareDialog` +
				`?stringifiedObjectParams=${params}` +
				`&requestId=${requestId}`;
			if (secretSocketId) url += `&secretSocketId=${secretSocketId}`;

			const response = await fetch(url, { credentials: 'include', headers: fetchHeaders });

			if (!response.ok) {
				return { error: true, status: response.status, message: await response.text() };
			}

			return response.json();
		},
		{ baseId, secretSocketId, fetchHeaders }
	);
}

/**
 * Tries cached fast path first; falls back to full navigation if no cache exists.
 * @param {string} connectionId
 * @param {Record<string, unknown>} cookieRecord - Lean document from airtable_cookies.
 * @param {string} seedUrl - Full URL to a record detail page for full navigation fallback.
 * @returns {Promise<{ browser: import('playwright').Browser, page: import('playwright').Page, fetchHeaders: Record<string, string>, secretSocketId: string, cached: boolean }>}
 */
export async function resolveScraperHandle(connectionId, cookieRecord, seedUrl) {
	if (cookieRecord.cachedFetchHeaders) {
		const handle = await createFastScraperContext(
			cookieRecord.cookies,
			cookieRecord.cachedFetchHeaders,
			cookieRecord.cachedSecretSocketId ?? ''
		);
		handle.cached = true;
		return handle;
	}
	return createFullScraperHandle(connectionId, cookieRecord.cookies, seedUrl);
}

/**
 * Full SPA navigation path — captures fresh headers and caches them for next time.
 * Throws if the session cookies are rejected (redirect to login page).
 * @param {string} connectionId
 * @param {Array<Record<string, unknown>>} cookies
 * @param {string} seedUrl - Full URL to a record detail page.
 * @returns {Promise<{ browser: import('playwright').Browser, page: import('playwright').Page, fetchHeaders: Record<string, string>, secretSocketId: string, cached: boolean }>}
 */
export async function createFullScraperHandle(connectionId, cookies, seedUrl) {
	const handle = await createScraperContext(cookies, seedUrl);
	if (handle.page.url().includes('/login')) {
		await destroyScraperContext(handle);
		throw new Error('Cookies rejected — landed on the login page. Please re-authenticate.');
	}
	await updateCachedScraperContext(connectionId, handle.fetchHeaders, handle.secretSocketId);
	handle.cached = false;
	return handle;
}

/**
 * Listens for the first outgoing Airtable internal API request to capture
 * its headers and secretSocketId. Resolves with empty values on timeout.
 * @param {import('playwright').Page} page
 * @returns {Promise<{ headers: Record<string, string>, secretSocketId: string }>}
 */
function captureRequestContext(page) {
	return new Promise(resolve => {
		const timeout = setTimeout(() => resolve({ headers: {}, secretSocketId: '' }), CAPTURE_TIMEOUT_MS);
		let resolved = false;

		page.on('request', request => {
			if (resolved) return;
			const url = request.url();
			if (!url.includes(AIRTABLE_INTERNAL_API_PREFIX) || !url.includes(AIRTABLE_HOST)) return;

			resolved = true;
			clearTimeout(timeout);

			const socketMatch = url.match(/[?&]secretSocketId=([^&]+)/);
			resolve({
				headers: request.headers(),
				secretSocketId: socketMatch ? socketMatch[1] : ''
			});
		});
	});
}

/**
 * Strips hop-by-hop and cookie headers that should not be forwarded in fetch calls.
 * @param {Record<string, string>} headers - Raw request headers captured from the browser.
 * @returns {Record<string, string>}
 */
function filterHeadersForFetch(headers) {
	const skip = new Set(['host', 'content-length', 'connection', 'accept-encoding', 'cookie']);
	const filtered = {};
	for (const [key, value] of Object.entries(headers)) {
		if (!skip.has(key.toLowerCase())) {
			filtered[key] = value;
		}
	}
	return filtered;
}
