import { Types } from 'mongoose';

import { AirtableConnection } from '../models/airtable-connection.model.js';

/**
 * Upserts a row keyed by Airtable’s user id (OAuth integration record).
 * @param {string} airtableUserId - Stable id from Airtable whoami.
 * @param {{
 *   accessToken: string,
 *   refreshToken?: string,
 *   accessTokenExpiresAt?: Date,
 *   scope?: string,
 *   airtableUserEmail?: string
 * }} fields
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function upsertConnectionForAirtableUser(airtableUserId, fields) {
	const { accessToken, refreshToken, accessTokenExpiresAt, scope, airtableUserEmail } = fields;

	const setDoc = {
		airtableUserId,
		accessToken,
		refreshToken,
		accessTokenExpiresAt,
		scope,
		airtableUserEmail
	};

	return AirtableConnection.findOneAndUpdate({ airtableUserId }, { $set: setDoc }, { upsert: true, returnDocument: 'after' });
}

/**
 * Updates token-related fields on an existing connection.
 * @param {string} connectionId - Hex ObjectId string.
 * @param {{ accessToken: string, refreshToken?: string, accessTokenExpiresAt?: Date }} fields
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function updateConnectionTokens(connectionId, fields) {
	return AirtableConnection.findByIdAndUpdate(connectionId, { $set: fields }, { returnDocument: 'after' });
}

/**
 * Loads a connection by Mongo id with selected fields (lean document).
 * @param {string} connectionId - Hex ObjectId string.
 * @param {string} select - Mongoose select expression (e.g. `"airtableUserId"`).
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function findConnectionLeanById(connectionId, select) {
	if (!Types.ObjectId.isValid(connectionId)) {
		return null;
	}

	return AirtableConnection.findById(connectionId).select(select).lean();
}
