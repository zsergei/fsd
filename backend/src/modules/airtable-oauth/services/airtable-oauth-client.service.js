import { Buffer } from 'node:buffer';

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/meta';
const AIRTABLE_OAUTH_BASE_URL = 'https://airtable.com/oauth2/v1';

/**
 * Builds the Airtable OAuth2 authorize URL (includes PKCE challenge).
 * @param {string} stateString - OAuth `state` parameter.
 * @param {string} codeChallengeString - PKCE `code_challenge` (S256).
 * @returns {string} Full URL to redirect the user to.
 * @throws {Error} When required env vars are missing.
 */
export function buildAirtableAuthorizeUrl(stateString, codeChallengeString) {
	const clientId = process.env.AIRTABLE_CLIENT_ID;
	const redirectUri = process.env.AIRTABLE_OAUTH_REDIRECT_URI;
	const scopes = process.env.AIRTABLE_OAUTH_SCOPES?.trim() ?? '';

	if (!clientId || !redirectUri) {
		throw new Error('AIRTABLE_CLIENT_ID or AIRTABLE_OAUTH_REDIRECT_URI is not set');
	}

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: redirectUri,
		state: stateString,
		code_challenge: codeChallengeString,
		code_challenge_method: 'S256'
	});

	if (scopes) {
		params.set('scope', scopes);
	}

	return `${AIRTABLE_OAUTH_BASE_URL}/authorize?${params.toString()}`;
}

/**
 * Exchanges an authorization code for tokens at Airtable (includes PKCE verifier).
 * @param {string} codeString - Authorization code from the callback query.
 * @param {string} codeVerifierString - PKCE verifier matching the original challenge.
 * @returns {Promise<Record<string, unknown>>} Parsed token JSON from Airtable.
 * @throws {Error} On non-OK HTTP response or missing error details.
 */
export async function exchangeAuthorizationCodeForTokens(codeString, codeVerifierString) {
	const clientId = process.env.AIRTABLE_CLIENT_ID?.trim() ?? '';
	const clientSecret = process.env.AIRTABLE_CLIENT_SECRET?.trim() ?? '';

	if (!clientId || !clientSecret) {
		throw new Error('AIRTABLE_CLIENT_ID or AIRTABLE_CLIENT_SECRET is not set');
	}

	const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code: codeString,
		redirect_uri: process.env.AIRTABLE_OAUTH_REDIRECT_URI?.trim() ?? '',
		code_verifier: codeVerifierString
	});

	const res = await fetch(`${AIRTABLE_OAUTH_BASE_URL}/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${basic}`
		},
		body: body.toString()
	});

	const tokenData = await res.json();
	if (!res.ok) {
		const msg = tokenData.error_description || tokenData.error || 'Token exchange failed';
		throw new Error(msg);
	}

	return tokenData;
}

/**
 * Refreshes an expired Airtable OAuth access token using the refresh token.
 * @param {string} refreshToken - Airtable OAuth refresh token.
 * @returns {Promise<Record<string, unknown>>} Parsed token JSON (`access_token`, `refresh_token`, `expires_in`, …).
 * @throws {Error} On non-OK HTTP response or missing credentials.
 */
export async function refreshAirtableTokens(refreshToken) {
	const clientId = process.env.AIRTABLE_CLIENT_ID?.trim() ?? '';
	const clientSecret = process.env.AIRTABLE_CLIENT_SECRET?.trim() ?? '';

	if (!clientId || !clientSecret) {
		throw new Error('AIRTABLE_CLIENT_ID or AIRTABLE_CLIENT_SECRET is not set');
	}

	const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	});

	const res = await fetch(`${AIRTABLE_OAUTH_BASE_URL}/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${basic}`
		},
		body: body.toString()
	});

	const tokenData = await res.json();
	if (!res.ok) {
		const msg = tokenData.error_description || tokenData.error || 'Token refresh failed';
		throw new Error(msg);
	}

	return tokenData;
}

/**
 * Calls Airtable meta whoami with a bearer access token.
 * @param {string} accessToken - Airtable OAuth access token.
 * @returns {Promise<Record<string, unknown>>} Parsed whoami JSON.
 * @throws {Error} On non-OK HTTP response.
 */
export async function fetchAirtableWhoAmI(accessToken) {
	const res = await fetch(`${AIRTABLE_API_URL}/whoami`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	const whoamiData = await res.json();
	if (!res.ok) {
		const msg = whoamiData.error?.message || whoamiData.error || 'whoami failed';
		throw new Error(msg);
	}

	return whoamiData;
}
