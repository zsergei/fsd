import type { AppEnvironment } from './models/environment.interfaces';

export const environment: AppEnvironment = {
	appEnv: {
		production: false,
		name: 'local',
		apiBaseUrl: '/api'
	},
	appSettings: {
		title: 'FSD App'
	}
};
