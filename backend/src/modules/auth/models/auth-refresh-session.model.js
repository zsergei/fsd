import { Schema, model } from 'mongoose';

const authRefreshSessionSchema = new Schema(
	{
		jti: { type: String, required: true, unique: true },
		connectionId: { type: Schema.Types.ObjectId, ref: 'AirtableConnection', required: true },
		expiresAt: { type: Date, required: true },
		revoked: { type: Boolean, default: false }
	},
	{ collection: 'auth_refresh_sessions' }
);

authRefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthRefreshSession = model('AuthRefreshSession', authRefreshSessionSchema);
