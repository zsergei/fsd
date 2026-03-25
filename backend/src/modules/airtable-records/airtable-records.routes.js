import { Router } from 'express';

import { getRecords, postSyncRecords } from './controllers/airtable-record.controller.js';
import { requireAccessJwt } from '../../shared/middleware/require-access-jwt.middleware.js';

export const airtableRecordsRouter = Router();

/**
 * @openapi
 * /airtable/records/sync:
 *   post:
 *     tags: [Airtable records]
 *     summary: Sync records for all tables from Airtable into MongoDB
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncCountResponse'
 *       '502':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableRecordsRouter.post('/airtable/records/sync', requireAccessJwt, postSyncRecords);

/**
 * @openapi
 * /airtable/records:
 *   get:
 *     tags: [Airtable records]
 *     summary: List stored records; optional filters baseId and tableId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: baseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecordsListResponse'
 */
airtableRecordsRouter.get('/airtable/records', requireAccessJwt, getRecords);
