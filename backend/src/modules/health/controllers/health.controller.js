import { buildHealthStatusPayload } from '../services/health-rest.service.js';

/**
 * Returns service name, environment, and a coarse database readiness flag.
 * @type {import('express').RequestHandler}
 */
export function getHealth(_req, res) {
	res.json(buildHealthStatusPayload());
}
