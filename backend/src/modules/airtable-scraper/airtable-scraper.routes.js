import { Router } from 'express';

import { requireAccessJwt } from '../../shared/middleware/require-access-jwt.middleware.js';
import { getCookieStatus, getRevisions, getUsers, postLogin, postMfa, postSyncRevisions, postSyncUsers } from './controllers/airtable-scraper.controller.js';

export const airtableScraperRouter = Router();

/**
 * @openapi
 * /scraper/auth/login:
 *   post:
 *     tags: [Airtable scraper]
 *     summary: Start Airtable login via headless browser (SSE stream)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: text/event-stream with login progress
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       '400':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableScraperRouter.post('/scraper/auth/login', requireAccessJwt, postLogin);

/**
 * @openapi
 * /scraper/auth/mfa:
 *   post:
 *     tags: [Airtable scraper]
 *     summary: Complete MFA for a pending scraper login session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MfaRequest'
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MfaSuccess'
 *       '400':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       '502':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableScraperRouter.post('/scraper/auth/mfa', requireAccessJwt, postMfa);

/**
 * @openapi
 * /scraper/auth/cookies/status:
 *   get:
 *     tags: [Airtable scraper]
 *     summary: Cookie validity for stored Airtable session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CookieStatus'
 */
airtableScraperRouter.get('/scraper/auth/cookies/status', requireAccessJwt, getCookieStatus);

/**
 * @openapi
 * /scraper/revisions/sync:
 *   post:
 *     tags: [Airtable scraper]
 *     summary: Scrape revision history for all records in the connection
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevisionSyncResult'
 *       '502':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableScraperRouter.post('/scraper/revisions/sync', requireAccessJwt, postSyncRevisions);

/**
 * @openapi
 * /scraper/revisions:
 *   get:
 *     tags: [Airtable scraper]
 *     summary: List stored revisions for the connection
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonObjectArray'
 */
airtableScraperRouter.get('/scraper/revisions', requireAccessJwt, getRevisions);

/**
 * @openapi
 * /scraper/users/sync:
 *   post:
 *     tags: [Airtable scraper]
 *     summary: Scrape collaborators (users) for the connection
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSyncResult'
 *       '502':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
airtableScraperRouter.post('/scraper/users/sync', requireAccessJwt, postSyncUsers);

/**
 * @openapi
 * /scraper/users:
 *   get:
 *     tags: [Airtable scraper]
 *     summary: List stored Airtable users for the connection
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JsonObjectArray'
 */
airtableScraperRouter.get('/scraper/users', requireAccessJwt, getUsers);
