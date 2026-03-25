import { setRefreshTokenCookie } from '../../auth/utils/refresh-cookie.util.js';
import { buildOAuthErrorCallbackUrl, buildOAuthSuccessCallbackUrl } from '../utils/callback-urls-builder.util.js';
import { completeAirtableOAuthCallback, startAirtableOAuthAuthorize } from '../services/airtable-oauth-rest.service.js';

/**
 * Express handler: redirects the browser to Airtable's OAuth authorize page.
 * @type {import('express').RequestHandler}
 */
export async function getAuthorize(_req, res) {
	try {
		const { redirectUrl } = await startAirtableOAuthAuthorize();
		res.redirect(302, redirectUrl);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'OAuth start failed';
		res.redirect(302, buildOAuthErrorCallbackUrl(message));
	}
}

/**
 * Express handler: OAuth callback; sets httpOnly refresh cookie, redirects to SPA with access token in hash.
 * @type {import('express').RequestHandler}
 */
export async function getCallback(req, res) {
	const result = await completeAirtableOAuthCallback(req.query);
	if (result.kind === 'error') {
		res.redirect(302, buildOAuthErrorCallbackUrl(result.message ?? 'OAuth failed'));
		return;
	}

	setRefreshTokenCookie(res, result.refreshToken ?? '');
	res.redirect(302, buildOAuthSuccessCallbackUrl(result.accessToken ?? ''));
}
