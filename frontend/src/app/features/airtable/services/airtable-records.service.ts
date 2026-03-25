import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import { AirtableRecordsResponse, AirtableRecordsSyncResponse } from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableRecordsService {
	private readonly http = inject(HttpClient);

	/** Triggers a sync of records for all tables and returns the count. */
	public syncRecords(): Observable<AirtableRecordsSyncResponse> {
		return this.http.post<AirtableRecordsSyncResponse>(AIRTABLE_API_PATHS.SYNC_RECORDS, {});
	}

	/** Returns records stored in the backend database, optionally filtered by baseId and tableId. */
	public getRecords(baseId?: string, tableId?: string): Observable<AirtableRecordsResponse> {
		let params = new HttpParams();
		if (baseId) params = params.set('baseId', baseId);
		if (tableId) params = params.set('tableId', tableId);
		return this.http.get<AirtableRecordsResponse>(AIRTABLE_API_PATHS.RECORDS, { params });
	}
}
