import { AppEnvName } from './environment.types';

export interface AppEnvConfig {
	readonly production: boolean;
	readonly name: AppEnvName;
	readonly apiBaseUrl: string;
}

export interface AppSettingsConfig {
	readonly title: string;
}

export interface AppEnvironment {
	readonly appEnv: AppEnvConfig;
	readonly appSettings: AppSettingsConfig;
}
