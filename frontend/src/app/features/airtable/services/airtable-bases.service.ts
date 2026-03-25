import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import { AirtableBasesResponse } from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableBasesService {
	private readonly http = inject(HttpClient);

	/** Triggers a sync from the Airtable Meta API and returns the fresh list. */
	public syncBases(): Observable<AirtableBasesResponse> {
		return this.http.post<AirtableBasesResponse>(AIRTABLE_API_PATHS.SYNC_BASES, {});
	}

	/** Returns bases already stored in the backend database. */
	public getBases(): Observable<AirtableBasesResponse> {
		return this.http.get<AirtableBasesResponse>(AIRTABLE_API_PATHS.BASES);
	}
}
