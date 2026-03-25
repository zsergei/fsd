import type { AppEnvironment } from './models/environment.interfaces';

export const environment: AppEnvironment = {
	appEnv: {
		production: false,
		name: 'dev',
		apiBaseUrl: 'https://your-dev-api.example.com/api'
	},
	appSettings: {
		title: 'Example App Dev'
	}
};
