import './core/env-loader.js';
import './modules/airtable-bases/models/airtable-base.model.js';
import './modules/airtable-tables/models/airtable-table.model.js';
import './modules/airtable-records/models/airtable-record.model.js';
import './modules/airtable-scraper/models/airtable-cookie.model.js';
import './modules/airtable-scraper/models/airtable-revision.model.js';
import './modules/airtable-scraper/models/airtable-user.model.js';
import './modules/airtable-connections/models/airtable-connection.model.js';
import './modules/airtable-oauth/models/airtable-oauth-state.model.js';
import './modules/auth/models/auth-refresh-session.model.js';
import { createApp } from './app.js';
import { connectMongo, disconnectMongo } from './core/mongo-init.js';

await connectMongo();

const app = createApp();
const port = Number(process.env.APP_PORT ?? process.env.PORT) || 3000;
const appTitle = process.env.APP_TITLE || 'app-api';

const server = app.listen(port, '0.0.0.0', () => {
	console.log(`${appTitle} listening on ${port}`);
});

const shutdown = () => {
	server.close(() => {
		disconnectMongo().finally(() => process.exit(0));
	});
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
