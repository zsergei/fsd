import { Schema, model } from 'mongoose';

const airtableRevisionSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		uuid: { type: String, required: true },
		issueId: { type: String, required: true },
		columnType: { type: String, required: true },
		oldValue: { type: String, default: null },
		newValue: { type: String, default: null },
		createdDate: { type: Date },
		authoredBy: { type: String }
	},
	{ timestamps: true, collection: 'airtable_revisions' }
);

airtableRevisionSchema.index(
	{ connectionId: 1, uuid: 1, columnType: 1 },
	{ unique: true }
);

export const AirtableRevision = model('AirtableRevision', airtableRevisionSchema);
