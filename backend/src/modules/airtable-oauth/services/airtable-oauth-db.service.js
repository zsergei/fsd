import { AirtableOAuthState } from '../models/airtable-oauth-state.model.js';

const STATE_TTL_MS = 10 * 60 * 1000;

/**
 * Stores OAuth state and PKCE verifier until the provider redirects back (or TTL expires).
 * @param {string} state - Opaque `state` query value for the authorize request.
 * @param {string} codeVerifier - PKCE verifier to send later at the token endpoint.
 * @returns {Promise<void>}
 */
export async function persistAuthorizationState(state, codeVerifier) {
	await AirtableOAuthState.create({
		state,
		codeVerifier,
		expiresAt: new Date(Date.now() + STATE_TTL_MS)
	});
}

/**
 * Atomically reads and deletes a pending OAuth state document.
 * @param {string} state - `state` returned by the OAuth callback.
 * @returns {Promise<{ codeVerifier: string } | null>} Verifier if the state existed and was valid.
 */
export async function consumeAuthorizationState(state) {
	const doc = await AirtableOAuthState.findOneAndDelete({ state });
	return doc ? { codeVerifier: doc.codeVerifier } : null;
}
