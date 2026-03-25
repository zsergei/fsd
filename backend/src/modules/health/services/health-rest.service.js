import { isMongoDbConnected } from '../../../core/mongo-init.js';

/**
 * Builds the JSON body for `GET /health` (liveness + Mongo connectivity hint).
 * @returns {{ service: string, env: string, status: string, database: 'ok' | 'down' }}
 */
export function buildHealthStatusPayload() {
	const appEnv = process.env.APP_ENV || 'local';
	return {
		service: process.env.APP_TITLE || 'app-api',
		env: appEnv,
		status: 'ok',
		database: isMongoDbConnected() ? 'ok' : 'down'
	};
}
