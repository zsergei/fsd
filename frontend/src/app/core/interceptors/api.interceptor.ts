import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Prepends `apiBaseUrl` to relative requests and attaches credentials so the browser sends httpOnly cookies.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
	if (req.url.startsWith('http')) {
		return next(req);
	}

	return next(
		req.clone({
			url: `${environment.appEnv.apiBaseUrl}${req.url}`,
			withCredentials: true
		})
	);
};
