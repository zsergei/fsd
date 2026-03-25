import { Schema, model } from 'mongoose';

/** Stores Airtable base metadata synced from the Meta API. */
const airtableBaseSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		airtableBaseId: { type: String, required: true },
		name: { type: String, required: true },
		permissionLevel: { type: String }
	},
	{ timestamps: true, collection: 'airtable_bases' }
);

airtableBaseSchema.index({ connectionId: 1, airtableBaseId: 1 }, { unique: true });

export const AirtableBase = model('AirtableBase', airtableBaseSchema);
