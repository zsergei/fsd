import { issueTokenPair } from '../../auth/services/auth-rest.service.js';
import { consumeAuthorizationState, persistAuthorizationState } from './airtable-oauth-db.service.js';
import { upsertConnectionFromOAuth } from '../../airtable-connections/services/airtable-connection-rest.service.js';
import { generateCodeChallengeString, generateCodeVerifierString, generateOauthStateString } from '../utils/pkce.util.js';
import { buildAirtableAuthorizeUrl, exchangeAuthorizationCodeForTokens, fetchAirtableWhoAmI } from './airtable-oauth-client.service.js';

/**
 * Starts the Airtable OAuth browser flow: persists state/PKCE and returns the IdP URL.
 * @returns {Promise<{ redirectUrl: string }>}
 * @throws {Error} When persistence or URL construction fails.
 */
export async function startAirtableOAuthAuthorize() {
	const stateString = generateOauthStateString();
	const codeVerifier = generateCodeVerifierString();
	const codeChallenge = generateCodeChallengeString(codeVerifier);

	await persistAuthorizationState(stateString, codeVerifier);
	const redirectUrl = buildAirtableAuthorizeUrl(stateString, codeChallenge);

	return { redirectUrl };
}

/**
 * @typedef {{ kind: 'success', accessToken: string, refreshToken: string }} AirtableOAuthCallbackSuccess
 * @typedef {{ kind: 'error', message: string }} AirtableOAuthCallbackError
 * @typedef {AirtableOAuthCallbackSuccess | AirtableOAuthCallbackError} AirtableOAuthCallbackResult
 */

/**
 * Completes the OAuth flow after the user returns from Airtable (validates state, exchanges code, issues app JWTs).
 * Always resolves to a result object; does not throw (DB/network errors become `kind: 'error'`).
 * @param {Record<string, unknown>} query - Express `req.query` (code, state, error, error_description).
 * @returns {Promise<AirtableOAuthCallbackResult>}
 */
export async function completeAirtableOAuthCallback(query) {
	const code = query.code;
	const state = query.state;
	const error = query.error;
	const errorDescription = query.error_description;

	if (error != null) {
		return {
			kind: 'error',
			message: String(errorDescription != null ? errorDescription : error)
		};
	}
	if (typeof code !== 'string' || typeof state !== 'string') {
		return { kind: 'error', message: 'Missing code or state' };
	}

	try {
		const oauth = await consumeAuthorizationState(state);
		if (!oauth) {
			return { kind: 'error', message: 'Invalid or expired state' };
		}

		const tokenJson = await exchangeAuthorizationCodeForTokens(code, oauth.codeVerifier);
		const accessToken = tokenJson.access_token;
		if (typeof accessToken !== 'string') {
			return { kind: 'error', message: 'Token response missing access_token' };
		}
		const who = await fetchAirtableWhoAmI(accessToken);
		const connection = await upsertConnectionFromOAuth(tokenJson, who);
		const tokens = await issueTokenPair(connection._id);

		return {
			kind: 'success',
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken
		};
	} catch (err) {
		return {
			kind: 'error',
			message: err instanceof Error ? err.message : 'OAuth failed'
		};
	}
}
