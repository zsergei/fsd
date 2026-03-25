import { map, Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

import type { CollectionId } from '../models/data-grid.types';

import { AirtableUsersService } from '../../airtable/services/airtable-users.service';
import { AirtableBasesService } from '../../airtable/services/airtable-bases.service';
import { AirtableTablesService } from '../../airtable/services/airtable-tables.service';
import { AirtableRecordsService } from '../../airtable/services/airtable-records.service';
import { AirtableRevisionsService } from '../../airtable/services/airtable-revisions.service';

@Injectable({ providedIn: 'root' })
export class DataGridService {
	private readonly basesService = inject(AirtableBasesService);
	private readonly tablesService = inject(AirtableTablesService);
	private readonly recordsService = inject(AirtableRecordsService);
	private readonly revisionsService = inject(AirtableRevisionsService);
	private readonly usersService = inject(AirtableUsersService);

	/** Fetches all rows for the given collection and returns them as a flat array. */
	public getCollection(collection: CollectionId): Observable<Record<string, unknown>[]> {
		const toRows = <T>(arr: T[]): Record<string, unknown>[] => arr as unknown as Record<string, unknown>[];
		switch (collection) {
			case 'airtable_bases':
				return this.basesService.getBases().pipe(map(r => toRows(r.bases)));
			case 'airtable_tables':
				return this.tablesService.getTables().pipe(map(r => toRows(r.tables)));
			case 'airtable_records':
				return this.recordsService.getRecords().pipe(map(r => toRows(r.records)));
			case 'airtable_revisions':
				return this.revisionsService.getRevisions().pipe(map(r => toRows(r)));
			case 'airtable_users':
				return this.usersService.getUsers().pipe(map(r => toRows(r)));
		}
	}
}
