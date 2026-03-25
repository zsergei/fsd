export const openApiDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'app-api',
		version: '0.0.5'
	},
	servers: [{ url: '/api' }],
	tags: [
		{ name: 'Health' },
		{ name: 'Auth' },
		{ name: 'Airtable OAuth' },
		{ name: 'Airtable bases' },
		{ name: 'Airtable tables' },
		{ name: 'Airtable records' },
		{ name: 'Airtable scraper' }
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT'
			},
			refreshCookie: {
				type: 'apiKey',
				in: 'cookie',
				name: 'refresh_token',
				description: 'httpOnly refresh JWT; override cookie name with REFRESH_COOKIE_NAME'
			}
		},
		schemas: {
			ErrorMessage: {
				type: 'object',
				properties: { error: { type: 'string' } },
				required: ['error']
			},
			AccessTokenResponse: {
				type: 'object',
				properties: { accessToken: { type: 'string' } },
				required: ['accessToken']
			},
			MeResponse: {
				type: 'object',
				properties: {
					connectionId: { type: 'string' },
					airtableUserId: { type: 'string', nullable: true },
					airtableUserEmail: { type: 'string', nullable: true }
				},
				required: ['connectionId']
			},
			HealthStatus: {
				type: 'object',
				properties: {
					service: { type: 'string' },
					env: { type: 'string' },
					status: { type: 'string' },
					database: { type: 'string', enum: ['ok', 'down'] }
				}
			},
			BasesListResponse: {
				type: 'object',
				properties: {
					bases: { type: 'array', items: { type: 'object', additionalProperties: true } }
				}
			},
			TablesListResponse: {
				type: 'object',
				properties: {
					tables: { type: 'array', items: { type: 'object', additionalProperties: true } }
				}
			},
			RecordsListResponse: {
				type: 'object',
				properties: {
					records: { type: 'array', items: { type: 'object', additionalProperties: true } }
				}
			},
			SyncCountResponse: {
				type: 'object',
				properties: { count: { type: 'integer' } },
				required: ['count']
			},
			LoginRequest: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					password: { type: 'string', format: 'password' }
				}
			},
			MfaRequest: {
				type: 'object',
				required: ['sessionId', 'code'],
				properties: {
					sessionId: { type: 'string' },
					code: { type: 'string' }
				}
			},
			MfaSuccess: {
				type: 'object',
				properties: { status: { type: 'string', example: 'success' } }
			},
			CookieStatus: {
				type: 'object',
				additionalProperties: true
			},
			RevisionSyncResult: {
				type: 'object',
				properties: {
					status: { type: 'string' },
					revisionsStored: { type: 'integer' }
				}
			},
			UserSyncResult: {
				type: 'object',
				properties: {
					status: { type: 'string' },
					usersStored: { type: 'integer' }
				}
			},
			JsonObjectArray: {
				type: 'array',
				items: { type: 'object', additionalProperties: true }
			}
		}
	}
};
