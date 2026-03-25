import path from 'node:path';
import process from 'node:process';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { openApiDefinition } from './openapi-definition.js';

export function registerSwaggerUi(app) {
	const apiTitle = (process.env.APP_TITLE ?? '').trim() || 'app-api';
	const apisGlob = path.join(process.cwd(), 'src/modules/**/*.routes.js');
	const openapiSpecification = swaggerJsdoc({
		definition: {
			...openApiDefinition,
			info: { ...openApiDefinition.info, title: apiTitle }
		},
		apis: [apisGlob],
		failOnErrors: true
	});

	app.use('/doc', swaggerUi.serve, swaggerUi.setup(openapiSpecification, { customSiteTitle: apiTitle }));
}
