import mongoose from 'mongoose';

const MONGOOSE_READY_STATE_CONNECTED = 1;

/**
 * Returns a trimmed MongoDB connection string from `MONGODB_URI`.
 * @returns {string}
 * @throws {Error} When the variable is missing or whitespace-only.
 */
function getMongoDbUri() {
	const uri = process.env.MONGODB_URI?.trim();
	if (!uri) {
		throw new Error('MONGODB_URI is not set');
	}
	return uri;
}

/**
 * Opens the default Mongoose connection.
 * @returns {Promise<void>}
 * @throws {Error} When the URI is missing or `mongoose.connect` fails.
 */
export async function connectMongo() {
	const uri = getMongoDbUri();
	try {
		await mongoose.connect(uri);
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`MongoDB connection failed: ${detail}`);
	}
}

/**
 * Closes all Mongoose connections.
 * @returns {Promise<void>}
 * @throws {Error} When disconnect fails unexpectedly.
 */
export async function disconnectMongo() {
	try {
		await mongoose.disconnect();
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`MongoDB disconnect failed: ${detail}`);
	}
}

/**
 * Whether the default connection is currently connected (not connecting/disconnecting).
 * @returns {boolean}
 */
export function isMongoDbConnected() {
	return mongoose.connection.readyState === MONGOOSE_READY_STATE_CONNECTED;
}
