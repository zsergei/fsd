import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import { AirtableRevision, AirtableRevisionsSyncResponse } from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableRevisionsService {
	private readonly http = inject(HttpClient);

	/** Triggers server-side revision history scraping for all records. */
	public syncRevisions(): Observable<AirtableRevisionsSyncResponse> {
		return this.http.post<AirtableRevisionsSyncResponse>(AIRTABLE_API_PATHS.SYNC_REVISIONS, {});
	}

	/** Fetches all stored revisions. */
	public getRevisions(): Observable<AirtableRevision[]> {
		return this.http.get<AirtableRevision[]>(AIRTABLE_API_PATHS.REVISIONS);
	}
}
