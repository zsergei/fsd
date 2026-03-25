import { startLoginSession, submitMfaCode } from './airtable-scraper-session.service.js';
import { findCookiesForConnection, upsertCookiesForConnection } from './airtable-cookie-db.service.js';

const SESSION_COOKIE_NAME = '__Host-airtable-session';

/**
 * Initiates Airtable login via Playwright as an SSE stream on the given response.
 * Sends `{ step }` progress events and a final `{ type: 'result' | 'error', ... }` event.
 * Fully manages the SSE lifecycle (headers, writes, end).
 * @param {string} connectionId
 * @param {string} email
 * @param {string} password
 * @param {import('express').Response} res
 */
export async function initiateLoginSse(connectionId, email, password, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();

	const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
	const onProgress = (step) => sendEvent({ step });

	try {
		const result = await startLoginSession(email, password, onProgress);

		if (result.status === 'success') {
			onProgress('Saving session...');
			await upsertCookiesForConnection(connectionId, result.cookies, result.expiresAt);
		}

		sendEvent({ type: 'result', status: result.status, sessionId: result.sessionId });
	} catch (err) {
		const isCaptcha = err instanceof Error && err.message === 'CAPTCHA';
		sendEvent({
			type: 'error',
			message: isCaptcha
				? 'Airtable is showing a bot verification challenge. Please wait a few minutes and try again.'
				: 'Authorization failed. Please check your email and password.'
		});
	} finally {
		res.end();
	}
}

/**
 * Completes the MFA step for an active login session and stores the resulting cookies.
 * @param {string} connectionId
 * @param {string} sessionId
 * @param {string} code - MFA/TOTP code.
 * @returns {Promise<void>}
 */
export async function completeMfa(connectionId, sessionId, code) {
	const { cookies, expiresAt } = await submitMfaCode(sessionId, code);
	await upsertCookiesForConnection(connectionId, cookies, expiresAt);
}

/**
 * Checks whether stored cookies exist and haven't expired.
 * Actual validity is confirmed during scraping — PerimeterX cookies can't be validated via plain fetch.
 * @param {string} connectionId
 * @returns {Promise<{ valid: boolean, expiresAt: Date | null }>}
 */
export async function validateCookies(connectionId) {
	const record = await findCookiesForConnection(connectionId);
	if (!record?.cookies) return { valid: false, expiresAt: null };

	const sessionCookie = record.cookies.find(cookie => cookie.name === SESSION_COOKIE_NAME);
	if (!sessionCookie) return { valid: false, expiresAt: record.expiresAt ?? null };

	const expired = record.expiresAt && new Date(record.expiresAt) < new Date();
	return { valid: !expired, expiresAt: record.expiresAt ?? null };
}
