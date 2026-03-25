import { Schema, model } from 'mongoose';

/** Stores OAuth state and PKCE verifier until the provider redirects back (or TTL expires). */
const airtableOauthStateSchema = new Schema(
	{
		state: { type: String, required: true, unique: true },
		codeVerifier: { type: String, required: true },
		expiresAt: { type: Date, required: true }
	},
	{ collection: 'airtable_oauth_states' }
);

airtableOauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AirtableOAuthState = model('AirtableOAuthState', airtableOauthStateSchema);
