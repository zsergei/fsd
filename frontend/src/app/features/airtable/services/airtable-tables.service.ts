import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import { AirtableTablesResponse } from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableTablesService {
	private readonly http = inject(HttpClient);

	/** Triggers a sync of tables for all bases and returns the fresh list. */
	public syncTables(): Observable<AirtableTablesResponse> {
		return this.http.post<AirtableTablesResponse>(AIRTABLE_API_PATHS.SYNC_TABLES, {});
	}

	/** Returns tables stored in the backend database, optionally filtered by baseId. */
	public getTables(baseId?: string): Observable<AirtableTablesResponse> {
		const params = baseId ? new HttpParams().set('baseId', baseId) : undefined;
		return this.http.get<AirtableTablesResponse>(AIRTABLE_API_PATHS.TABLES, { params });
	}
}
