import { Router } from 'express';

import { getHealth } from './controllers/health.controller.js';

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness and MongoDB readiness hint
 *     responses:
 *       '200':
 *         description: Service is up
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
healthRouter.get('/health', getHealth);
