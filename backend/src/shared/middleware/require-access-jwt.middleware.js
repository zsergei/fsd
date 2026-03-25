import { verifyAccessToken } from '../../modules/auth/utils/jwt-helper.util.js';

/**
 * Requires `Authorization: Bearer <access JWT>` (app session token). Sets `req.connectionId` from JWT `sub` (AirtableConnection id).
 * Use on any route that must be authenticated; not limited to the auth module.
 * @type {import('express').RequestHandler}
 */
export function requireAccessJwt(req, res, next) {
	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}
	const token = header.slice('Bearer '.length).trim();
	try {
		const payload = verifyAccessToken(token);
		req.connectionId = payload.sub;
		next();
	} catch {
		res.status(401).json({ error: 'Unauthorized' });
	}
}
