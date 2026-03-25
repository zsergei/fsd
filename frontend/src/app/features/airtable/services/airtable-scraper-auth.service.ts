import { inject, Injectable } from '@angular/core';
import { Observable, filter, mergeMap } from 'rxjs';
import { HttpClient, HttpDownloadProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import {
	LoginSseEvent,
	ScraperCookieStatusResponse,
	ScraperLoginRequest,
	ScraperMfaRequest,
	ScraperMfaResponse
} from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableScraperAuthService {
	private readonly http = inject(HttpClient);

	/** Initiates Airtable login via SSE stream. */
	public login(payload: ScraperLoginRequest): Observable<LoginSseEvent> {
		let parsed = 0;
		let buffer = '';

		return this.http
			.post(AIRTABLE_API_PATHS.SCRAPER_LOGIN, payload, {
				observe: 'events',
				reportProgress: true,
				responseType: 'text'
			})
			.pipe(
				filter(
					(event): event is HttpDownloadProgressEvent | HttpResponse<string> =>
						event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.Response
				),
				mergeMap(event => {
					const text = event.type === HttpEventType.DownloadProgress ? (event.partialText ?? '') : (event.body ?? '');

					const chunk = text.slice(parsed);
					parsed = text.length;
					buffer += chunk;

					const lines = buffer.split('\n');
					buffer = lines.pop() ?? '';

					const events: LoginSseEvent[] = [];
					for (const line of lines) {
						if (!line.startsWith('data: ')) continue;
						try {
							events.push(JSON.parse(line.slice(6)));
						} catch {
							/* skip malformed lines */
						}
					}
					return events;
				})
			);
	}

	/** Completes MFA verification for a pending login session. */
	public submitMfa(payload: ScraperMfaRequest): Observable<ScraperMfaResponse> {
		return this.http.post<ScraperMfaResponse>(AIRTABLE_API_PATHS.SCRAPER_MFA, payload);
	}

	/** Returns the validity status of stored Airtable cookies. */
	public checkCookieStatus(): Observable<ScraperCookieStatusResponse> {
		return this.http.get<ScraperCookieStatusResponse>(AIRTABLE_API_PATHS.SCRAPER_COOKIE_STATUS);
	}
}
