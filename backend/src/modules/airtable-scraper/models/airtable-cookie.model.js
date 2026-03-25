import { Schema, model } from 'mongoose';

const airtableCookieSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true, unique: true },
		cookies: { type: Schema.Types.Mixed, required: true },
		validatedAt: { type: Date },
		expiresAt: { type: Date },
		cachedFetchHeaders: { type: Schema.Types.Mixed },
		cachedSecretSocketId: { type: String }
	},
	{ timestamps: true, collection: 'airtable_cookies' }
);

export const AirtableCookie = model('AirtableCookie', airtableCookieSchema);
