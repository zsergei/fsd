import type { AppEnvironment } from './models/environment.interfaces';

export const environment: AppEnvironment = {
	appEnv: {
		production: false,
		name: 'dev',
		apiBaseUrl: '/api'
	},
	appSettings: {
		title: 'FSD App'
	}
};
