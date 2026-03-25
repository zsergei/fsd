import { Router } from 'express';

import { getBases, postSyncBases } from './controllers/airtable-base.controller.js';
import { requireAccessJwt } from '../../shared/middleware/require-access-jwt.middleware.js';

export const airtableBasesRouter = Router();

/**
 * @openapi
 * /airtable/bases/sync:
 *   post:
 *     tags: [Airtable bases]
 *     summary: Sync bases from Airtable into MongoDB
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Synced bases
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasesListResponse'
 *       '502':
 *         description: Upstream or sync error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableBasesRouter.post('/airtable/bases/sync', requireAccessJwt, postSyncBases);

/**
 * @openapi
 * /airtable/bases:
 *   get:
 *     tags: [Airtable bases]
 *     summary: List stored bases for the connection
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasesListResponse'
 */
airtableBasesRouter.get('/airtable/bases', requireAccessJwt, getBases);
