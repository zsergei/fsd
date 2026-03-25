import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AppTitleStrategy } from './core/strategies/app-title.strategy';

export const appConfig: ApplicationConfig = {
	providers: [
		provideExperimentalZonelessChangeDetection(),
		provideAnimationsAsync(),
		provideHttpClient(withFetch(), withInterceptors([apiInterceptor, authInterceptor])),
		provideRouter(routes, withComponentInputBinding()),
		{ provide: TitleStrategy, useClass: AppTitleStrategy }
	]
};
