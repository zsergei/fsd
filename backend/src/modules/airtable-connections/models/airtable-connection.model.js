import { Schema, model } from 'mongoose';

/** Stores Airtable OAuth tokens and metadata per Airtable user. */
const airtableConnectionSchema = new Schema(
	{
		airtableUserId: { type: String, unique: true, sparse: true },
		airtableUserEmail: { type: String },
		accessToken: { type: String, required: true },
		refreshToken: { type: String },
		accessTokenExpiresAt: { type: Date },
		scope: { type: String }
	},
	{ timestamps: true, collection: 'airtable_connections' }
);

export const AirtableConnection = model('AirtableConnection', airtableConnectionSchema);
