import { AirtableUser } from '../models/airtable-user.model.js';

/**
 * Replaces all stored users for a connection with the given documents.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @param {Array<Record<string, unknown>>} userDocs - Pre-mapped documents.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
export async function replaceUsersForConnection(connectionId, userDocs) {
	await AirtableUser.deleteMany({ connectionId });

	if (userDocs.length === 0) return [];

	return AirtableUser.insertMany(userDocs);
}

/**
 * Returns all stored users for a connection.
 * @param {import('mongoose').Types.ObjectId | string} connectionId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function findUsersForConnection(connectionId) {
	return AirtableUser.find({ connectionId })
		.select('airtableUserId firstName lastName email profilePicUrl permissionLevel isDeactivated grantedByUserId createdTime source')
		.sort({ createdTime: 1 })
		.lean();
}
