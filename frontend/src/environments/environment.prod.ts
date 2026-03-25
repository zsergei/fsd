import type { AppEnvironment } from './models/environment.interfaces';

export const environment: AppEnvironment = {
	appEnv: {
		production: true,
		name: 'prod',
		apiBaseUrl: '/api'
	},
	appSettings: {
		title: 'FSD App'
	}
};
