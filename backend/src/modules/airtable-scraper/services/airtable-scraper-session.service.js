import { randomUUID } from 'node:crypto';

import { launchCamoufox, solvePerimeterXIfPresent } from './airtable-scraper-browser.service.js';

const AIRTABLE_LOGIN_URL = 'https://airtable.com/login';
const SESSION_TTL_MS = 5 * 60 * 1000;
const NAVIGATION_TIMEOUT_MS = 60_000;
const INPUT_WAIT_TIMEOUT_MS = 15_000;
const LOGIN_RESULT_TIMEOUT_MS = 30_000;

/** @type {Map<string, { browser: import('playwright').Browser, page: import('playwright').Page, timer: NodeJS.Timeout }>} */
const activeSessions = new Map();

/**
 * Closes and cleans up a browser session.
 * @param {string} sessionId
 */
function destroySession(sessionId) {
	const session = activeSessions.get(sessionId);
	if (!session) return;

	clearTimeout(session.timer);
	try { session.browser.close(); } catch { /* noop */ }
	activeSessions.delete(sessionId);
}

/** Closes all active browser sessions. Called before new login attempts to prevent resource leaks. */
function destroyAllSessions() {
	for (const id of activeSessions.keys()) {
		destroySession(id);
	}
}

/**
 * Creates a new Camoufox browser session with an auto-cleanup TTL.
 * Camoufox returns a Browser (not a BrowserContext), so we create an explicit context.
 * @returns {Promise<{ sessionId: string, browser: import('playwright').Browser, page: import('playwright').Page }>}
 */
async function createSession() {
	const browser = await launchCamoufox();
	const context = await browser.newContext();
	const page = await context.newPage();
	const sessionId = randomUUID();

	const timer = setTimeout(() => destroySession(sessionId), SESSION_TTL_MS);
	activeSessions.set(sessionId, { browser, page, timer });

	return { sessionId, browser, page };
}

/**
 * Resets the idle TTL so the user can retry MFA without the browser closing immediately after a failed attempt.
 * @param {string} sessionId
 */
function refreshSessionTimer(sessionId) {
	const session = activeSessions.get(sessionId);
	if (!session) return;
	clearTimeout(session.timer);
	session.timer = setTimeout(() => destroySession(sessionId), SESSION_TTL_MS);
}

/**
 * Detects whether the current page is showing an MFA prompt.
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
async function isMfaScreen(page) {
	return page
		.locator('input[name="code"], input[name="totpCode"], input[placeholder*="code" i]')
		.first()
		.isVisible({ timeout: 3000 })
		.catch(() => false);
}

/**
 * True when the URL path is past login, MFA, and pre-auth redirects (Airtable uses /2fa/... for TOTP).
 * @param {string} pathname
 * @returns {boolean}
 */
function isAirtablePostAuthPathname(pathname) {
	return !pathname.includes('/login') && !pathname.includes('/auth') && !pathname.includes('/2fa');
}

/**
 * Detects whether the login completed (user landed on the Airtable workspace).
 * @param {import('playwright').Page} page
 * @returns {boolean}
 */
function isLoggedIn(page) {
	try {
		return isAirtablePostAuthPathname(new URL(page.url()).pathname);
	} catch {
		return false;
	}
}

/**
 * Dismisses the OneTrust / generic cookie consent banner if present.
 * Uses the OneTrust accept button first, then falls back to generic "Accept" text.
 * @param {import('playwright').Page} page
 */
async function dismissCookieBanner(page) {
	const onetrust = page.locator('#onetrust-accept-btn-handler');
	if (await onetrust.isVisible({ timeout: 1_000 }).catch(() => false)) {
		await onetrust.click();
		await page.waitForTimeout(500);
		return;
	}
	const generic = page.locator('button:has-text("Accept All"), button:has-text("Accept")').first();
	if (await generic.isVisible({ timeout: 1_000 }).catch(() => false)) {
		await generic.click();
		await page.waitForTimeout(500);
	}
}

/**
 * Logs a compact JSON snapshot of visible buttons and all inputs (for debugging stuck login flows).
 * @param {import('playwright').Page} page
 * @param {string} logPrefix
 * @returns {Promise<void>}
 */
async function logLoginUiSnapshot(page, logPrefix) {
	try {
		const snapshot = await page.evaluate(() => {
			const doc = globalThis.document;
			const inputList = [...doc.querySelectorAll('input')].map((element) => ({
				autocomplete: element.autocomplete,
				id: element.id,
				name: element.name,
				placeholder: element.placeholder?.slice(0, 48) ?? '',
				type: element.type,
				visible: !!element.offsetParent
			}));
			const buttonLabels = [...doc.querySelectorAll('button')]
				.filter((buttonElement) => buttonElement.offsetParent)
				.slice(0, 30)
				.map(
					(buttonElement) =>
						buttonElement.innerText?.replace(/\s+/g, ' ').trim().slice(0, 100) ?? ''
				);
			const headingText = doc.querySelector('h1, h2')?.textContent?.trim().slice(0, 160) ?? '';
			return { buttonLabels, headingText, inputs: inputList };
		});
		console.error(`[${logPrefix}] login UI snapshot: ${JSON.stringify(snapshot)}`);
	} catch (snapshotError) {
		console.error(`[${logPrefix}] login UI snapshot failed: ${snapshotError.message}`);
	}
}

/**
 * After the email step, waits for the password field while dismissing banners, solving PerimeterX,
 * and clicking Continue or a password sign-in link when Airtable shows an intermediate screen.
 * @param {import('playwright').Page} page
 * @param {string} logTag
 * @param {(step: string) => void} [onProgress]
 * @returns {Promise<import('playwright').Locator>}
 * @throws {Error} When the password field does not appear within the deadline.
 */
async function waitForPasswordFieldAfterEmail(page, logTag, onProgress) {
	const passwordLocator = page
		.locator('input[name="password"], input[type="password"], input[autocomplete="current-password"]')
		.first();

	const deadline = Date.now() + 55_000;
	while (Date.now() < deadline) {
		await solvePerimeterXIfPresent(page, logTag, onProgress);
		await dismissCookieBanner(page);

		if (await passwordLocator.isVisible({ timeout: 900 }).catch(() => false)) {
			return passwordLocator;
		}

		const usePasswordLink = page.getByRole('link', { name: /password/i }).first();
		if (await usePasswordLink.isVisible({ timeout: 500 }).catch(() => false)) {
			await usePasswordLink.click();
			await page.waitForTimeout(1200);
			continue;
		}

		const continueButton = page.getByRole('button', { name: /Continue|Next/i }).first();
		if (await continueButton.isVisible({ timeout: 500 }).catch(() => false)) {
			await continueButton.click();
			await page.waitForTimeout(1500);
			continue;
		}

		await page.waitForTimeout(600);
	}

	await logLoginUiSnapshot(page, logTag);
	throw new Error('Login failed — password field not shown after email step');
}

/**
 * Extracts all cookies from the browser context and computes an approximate expiry.
 * @param {import('playwright').BrowserContext} context
 * @returns {Promise<{ cookies: Array<Record<string, unknown>>, expiresAt: Date }>}
 */
async function extractCookies(context) {
	const cookies = await context.cookies();
	const maxExpiry = cookies.reduce((latest, cookie) => {
		const exp = cookie.expires && cookie.expires > 0 ? cookie.expires * 1000 : 0;
		return exp > latest ? exp : latest;
	}, 0);

	const expiresAt = maxExpiry > 0 ? new Date(maxExpiry) : new Date(Date.now() + 24 * 60 * 60 * 1000);

	return { cookies, expiresAt };
}

/**
 * Starts a login session: launches Camoufox, navigates to Airtable login, enters email and password.
 * Cleans up any lingering sessions first to avoid resource leaks on retries.
 * @param {string} email
 * @param {string} password
 * @param {(step: string) => void} [onProgress] - Optional callback for real-time progress updates.
 * @returns {Promise<{ status: 'success' | 'mfa_required', sessionId: string, cookies?: Array<Record<string, unknown>>, expiresAt?: Date }>}
 */
export async function startLoginSession(email, password, onProgress) {
	destroyAllSessions();

	const { sessionId, page } = await createSession();
	const tag = sessionId.slice(0, 8);

	const progress = (userMessage) => {
		console.log(`[login:${tag}] ${userMessage}`);
		onProgress?.(userMessage);
	};

	try {
		progress('Opening Airtable login page...');
		await page.goto(AIRTABLE_LOGIN_URL, { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT_MS });
		await solvePerimeterXIfPresent(page, `login:${tag}`, onProgress);
		await dismissCookieBanner(page);

		const emailInput = page.locator('input[name="email"], input[type="email"]');
		await emailInput.waitFor({ state: 'visible', timeout: INPUT_WAIT_TIMEOUT_MS });
		await emailInput.click();
		await page.waitForTimeout(500);
		await emailInput.fill(email);
		await page.waitForTimeout(300);
		await emailInput.dispatchEvent('input');
		await emailInput.dispatchEvent('change');
		await page.waitForTimeout(500);
		progress('Entering credentials...');

		await dismissCookieBanner(page);
		await emailInput.press('Enter');
		await page.waitForTimeout(2000);
		await solvePerimeterXIfPresent(page, `login:${tag}`, onProgress);

		const passwordInput = await waitForPasswordFieldAfterEmail(page, `login:${tag}`, onProgress);
		await passwordInput.click();
		await page.waitForTimeout(500);
		await passwordInput.fill(password);
		await page.waitForTimeout(300);
		await passwordInput.dispatchEvent('input');
		await passwordInput.dispatchEvent('change');
		await page.waitForTimeout(500);
		progress('Signing in...');

		await dismissCookieBanner(page);
		await passwordInput.press('Enter');

		await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: LOGIN_RESULT_TIMEOUT_MS }).catch(() => {});

		if (isLoggedIn(page)) {
			progress('Extracting cookies...');
			const { cookies, expiresAt } = await extractCookies(page.context());
			destroySession(sessionId);
			return { status: 'success', sessionId, cookies, expiresAt };
		}

		if (await isMfaScreen(page)) {
			progress('Waiting for MFA...');
			return { status: 'mfa_required', sessionId };
		}

		console.error(
			`[login:${tag}] unexpected state url=${page.url()} title=${await page.title()}`
		);
		await logLoginUiSnapshot(page, `login:${tag}`);
		destroySession(sessionId);
		throw new Error('Login failed — unexpected page state after submitting credentials');
	} catch (error) {
		console.error(`[login:${tag}] ${error.message}`);
		destroySession(sessionId);
		throw error;
	}
}

/**
 * Submits an MFA code for a pending login session and extracts cookies on success.
 * @param {string} sessionId
 * @param {string} code - The MFA/TOTP code from the user.
 * @returns {Promise<{ cookies: Array<Record<string, unknown>>, expiresAt: Date }>}
 */
export async function submitMfaCode(sessionId, code) {
	const session = activeSessions.get(sessionId);
	if (!session) throw new Error('Session expired or not found');

	const { page } = session;
	const tag = `mfa:${sessionId.slice(0, 8)}`;
	refreshSessionTimer(sessionId);

	const trimmedCode = String(code).replace(/\s/g, '');

	try {
		await solvePerimeterXIfPresent(page, tag);
		await dismissCookieBanner(page);

		const codeInput = page
			.locator(
				[
					'input[name="code"]',
					'input[name="totpCode"]',
					'input[autocomplete="one-time-code"]',
					'input[inputmode="numeric"]',
					'input[type="tel"]',
					'input[placeholder*="code" i]',
					'input[aria-label*="code" i]'
				].join(', ')
			)
			.first();

		await codeInput.waitFor({ state: 'visible', timeout: INPUT_WAIT_TIMEOUT_MS });
		await codeInput.click();
		await codeInput.fill('');
		await codeInput.fill(trimmedCode);
		await codeInput.dispatchEvent('input');
		await codeInput.dispatchEvent('change');

		const submitByRole = page.getByRole('button', {
			name: /Continue|Verify|Submit|Next|Confirm|Sign in/i
		});
		const usedRoleButton = await submitByRole
			.first()
			.isVisible({ timeout: 5_000 })
			.catch(() => false);
		if (usedRoleButton) {
			await submitByRole.first().click();
		} else {
			const formSubmit = page.locator('form button[type="submit"]').first();
			const usedFormSubmit = await formSubmit.isVisible({ timeout: 2_000 }).catch(() => false);
			if (usedFormSubmit) {
				await formSubmit.click();
			} else {
				await codeInput.press('Enter');
			}
		}

		await page
			.waitForURL(url => isAirtablePostAuthPathname(url.pathname), { timeout: LOGIN_RESULT_TIMEOUT_MS })
			.catch(() => {});

		const pollDeadline = Date.now() + 15_000;
		while (!isLoggedIn(page) && Date.now() < pollDeadline) {
			await page.waitForTimeout(400);
		}

		if (!isLoggedIn(page)) {
			throw new Error('MFA verification failed — still on login or MFA page');
		}

		const { cookies, expiresAt } = await extractCookies(page.context());
		destroySession(sessionId);
		return { cookies, expiresAt };
	} catch (error) {
		refreshSessionTimer(sessionId);
		console.error(`[${tag}] ${error.message}`);
		throw error;
	}
}

/**
 * Cleans up a specific session (for manual abort).
 * @param {string} sessionId
 */
export function cleanupSession(sessionId) {
	destroySession(sessionId);
}
