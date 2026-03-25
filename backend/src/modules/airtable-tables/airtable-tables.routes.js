import { Router } from 'express';

import { getTables, postSyncTables } from './controllers/airtable-table.controller.js';
import { requireAccessJwt } from '../../shared/middleware/require-access-jwt.middleware.js';

export const airtableTablesRouter = Router();

/**
 * @openapi
 * /airtable/tables/sync:
 *   post:
 *     tags: [Airtable tables]
 *     summary: Sync tables for all bases from Airtable into MongoDB
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TablesListResponse'
 *       '502':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableTablesRouter.post('/airtable/tables/sync', requireAccessJwt, postSyncTables);

/**
 * @openapi
 * /airtable/tables:
 *   get:
 *     tags: [Airtable tables]
 *     summary: List stored tables; optional filter baseId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: baseId
 *         schema:
 *           type: string
 *         description: When set, only tables for this base
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TablesListResponse'
 */
airtableTablesRouter.get('/airtable/tables', requireAccessJwt, getTables);
