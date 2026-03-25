import { Router } from 'express';

import { getAuthorize, getCallback } from './controllers/airtable-oauth.controller.js';

export const airtableOauthRouter = Router();

/**
 * @openapi
 * /oauth/airtable/authorize:
 *   get:
 *     tags: [Airtable OAuth]
 *     summary: Redirect browser to Airtable OAuth consent
 *     responses:
 *       '302':
 *         description: Redirect to Airtable or SPA error URL
 */
airtableOauthRouter.get('/oauth/airtable/authorize', getAuthorize);

/**
 * @openapi
 * /oauth/airtable/callback:
 *   get:
 *     tags: [Airtable OAuth]
 *     summary: OAuth callback; sets refresh cookie and redirects to SPA with access token
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirect to SPA success or error URL
 */
airtableOauthRouter.get('/oauth/airtable/callback', getCallback);
