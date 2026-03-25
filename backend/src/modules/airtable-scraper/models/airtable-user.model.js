import { Schema, model } from 'mongoose';

const airtableUserSchema = new Schema(
	{
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		airtableUserId: { type: String, required: true },
		firstName: { type: String },
		lastName: { type: String },
		email: { type: String },
		profilePicUrl: { type: String },
		permissionLevel: { type: String },
		isDeactivated: { type: Boolean, default: false },
		grantedByUserId: { type: String },
		createdTime: { type: Date },
		source: { type: String, enum: ['collaborator', 'workspaceCollaborator'] }
	},
	{ timestamps: true, collection: 'airtable_users' }
);

airtableUserSchema.index(
	{ connectionId: 1, airtableUserId: 1 },
	{ unique: true }
);

export const AirtableUser = model('AirtableUser', airtableUserSchema);
