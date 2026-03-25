import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { sanitizeUrl } from './shared/utils/url-sanitizer.util.js';
import { registerSwaggerUi } from './shared/openapi/register-swagger.js';
import { airtableBasesRouter } from './modules/airtable-bases/airtable-bases.routes.js';
import { airtableOauthRouter } from './modules/airtable-oauth/airtable-oauth.routes.js';
import { airtableTablesRouter } from './modules/airtable-tables/airtable-tables.routes.js';
import { airtableRecordsRouter } from './modules/airtable-records/airtable-records.routes.js';
import { airtableScraperRouter } from './modules/airtable-scraper/airtable-scraper.routes.js';

export function createApp() {
	const app = express();
	const corsOrigin = sanitizeUrl(process.env.FRONTEND_URL);

	app.use(
		cors({
			origin: corsOrigin ?? true,
			credentials: true,
			methods: ['GET', 'POST', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization']
		})
	);

	app.use(cookieParser());
	app.use(express.json());
	app.use(healthRouter);
	app.use(airtableOauthRouter);
	app.use(airtableBasesRouter);
	app.use(airtableTablesRouter);
	app.use(airtableRecordsRouter);
	app.use(airtableScraperRouter);
	app.use(authRouter);

	registerSwaggerUi(app);

	return app;
}
