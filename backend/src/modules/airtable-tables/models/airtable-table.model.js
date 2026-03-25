import { Schema, model } from 'mongoose';

const airtableFieldSchema = new Schema(
	{
		airtableFieldId: { type: String, required: true },
		name: { type: String, required: true },
		type: { type: String, required: true },
		description: { type: String, default: '' }
	},
	{ _id: false }
);

const airtableViewSchema = new Schema(
	{
		airtableViewId: { type: String, required: true },
		name: { type: String, required: true },
		type: { type: String, required: true }
	},
	{ _id: false }
);

const airtableTableSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		airtableBaseId: { type: String, required: true },
		airtableTableId: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, default: '' },
		primaryFieldId: { type: String },
		fields: [airtableFieldSchema],
		views: [airtableViewSchema]
	},
	{ timestamps: true, collection: 'airtable_tables' }
);

airtableTableSchema.index({ connectionId: 1, airtableBaseId: 1, airtableTableId: 1 }, { unique: true });

export const AirtableTable = model('AirtableTable', airtableTableSchema);
