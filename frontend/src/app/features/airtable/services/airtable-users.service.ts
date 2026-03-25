import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { AIRTABLE_API_PATHS } from '../models/airtable.constants';
import { AirtableUser, AirtableUsersSyncResponse } from '../models/airtable.interfaces';

@Injectable({ providedIn: 'root' })
export class AirtableUsersService {
	private readonly http = inject(HttpClient);

	/** Triggers server-side collaborator scraping for the current connection. */
	public syncUsers(): Observable<AirtableUsersSyncResponse> {
		return this.http.post<AirtableUsersSyncResponse>(AIRTABLE_API_PATHS.SYNC_USERS, {});
	}

	/** Fetches all stored Airtable users (collaborators). */
	public getUsers(): Observable<AirtableUser[]> {
		return this.http.get<AirtableUser[]>(AIRTABLE_API_PATHS.USERS);
	}
}
