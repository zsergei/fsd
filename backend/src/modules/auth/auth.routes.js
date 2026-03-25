import { Router } from 'express';

import { getMe, postLogout, postRefresh } from './controllers/auth.controller.js';
import { requireAccessJwt } from '../../shared/middleware/require-access-jwt.middleware.js';

export const authRouter = Router();

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh JWT from httpOnly cookie; returns new access token
 *     security:
 *       - refreshCookie: []
 *     responses:
 *       '200':
 *         description: New access token (refresh cookie also rotated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessTokenResponse'
 *       '401':
 *         description: Missing or invalid refresh session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
authRouter.post('/auth/refresh', postRefresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh sessions and clear refresh cookie
 *     security:
 *       - refreshCookie: []
 *     responses:
 *       '204':
 *         description: Logged out (always returned for client cleanup)
 */
authRouter.post('/auth/logout', postLogout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current Airtable connection summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Connection metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *       '404':
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
authRouter.get('/auth/me', requireAccessJwt, getMe);
