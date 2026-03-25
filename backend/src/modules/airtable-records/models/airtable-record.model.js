import { Schema, model } from 'mongoose';

const airtableRecordSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		airtableBaseId: { type: String, required: true },
		airtableTableId: { type: String, required: true },
		airtableRecordId: { type: String, required: true },
		airtableCreatedTime: { type: Date }
	},
	{ timestamps: true, collection: 'airtable_records', strict: false }
);

airtableRecordSchema.index(
	{ connectionId: 1, airtableBaseId: 1, airtableTableId: 1, airtableRecordId: 1 },
	{ unique: true }
);

export const AirtableRecord = model('AirtableRecord', airtableRecordSchema);
