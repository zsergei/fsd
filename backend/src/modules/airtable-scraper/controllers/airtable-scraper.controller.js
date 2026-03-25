import { findUsersForConnection } from '../services/airtable-user-db.service.js';
import { syncUsersForConnection } from '../services/airtable-user-rest.service.js';
import { findRevisionsForConnection } from '../services/airtable-revision-db.service.js';
import { syncRevisionsForConnection } from '../services/airtable-revision-rest.service.js';
import { completeMfa, initiateLoginSse, validateCookies } from '../services/airtable-cookie-rest.service.js';

/**
 * Initiates Airtable login via headless browser as an SSE stream.
 * @type {import('express').RequestHandler}
 */
export async function postLogin(req, res) {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	await initiateLoginSse(req.connectionId, email, password, res);
}

/**
 * Completes MFA verification for a pending login session.
 * @type {import('express').RequestHandler}
 */
export async function postMfa(req, res) {
	const { sessionId, code } = req.body;

	if (!sessionId || !code) {
		return res.status(400).json({ error: 'Session ID and MFA code are required' });
	}

	try {
		await completeMfa(req.connectionId, sessionId, code);
		res.json({ status: 'success' });
	} catch {
		res.status(502).json({ error: 'MFA verification failed. Please try again.' });
	}
}

/**
 * Returns the validity status of stored Airtable cookies for the current connection.
 * @type {import('express').RequestHandler}
 */
export async function getCookieStatus(req, res) {
	const result = await validateCookies(req.connectionId);
	res.json(result);
}

/**
 * Triggers revision history scraping for the current connection.
 * @type {import('express').RequestHandler}
 */
export async function postSyncRevisions(req, res) {
	try {
		const count = await syncRevisionsForConnection(req.connectionId);
		res.json({ status: 'success', revisionsStored: count });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Revision scraping failed';
		res.status(502).json({ error: message });
	}
}

/**
 * Returns stored revisions for the current connection.
 * @type {import('express').RequestHandler}
 */
export async function getRevisions(req, res) {
	const revisions = await findRevisionsForConnection(req.connectionId);
	res.json(revisions);
}

/**
 * Triggers collaborator scraping for the current connection.
 * @type {import('express').RequestHandler}
 */
export async function postSyncUsers(req, res) {
	try {
		const count = await syncUsersForConnection(req.connectionId);
		res.json({ status: 'success', usersStored: count });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'User scraping failed';
		res.status(502).json({ error: message });
	}
}

/**
 * Returns stored Airtable users (collaborators) for the current connection.
 * @type {import('express').RequestHandler}
 */
export async function getUsers(req, res) {
	const users = await findUsersForConnection(req.connectionId);
	res.json(users);
}
