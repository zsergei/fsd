import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, of, switchMap, tap } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AirtableBasesService } from './airtable-bases.service';
import { AirtableUsersService } from './airtable-users.service';
import { AirtableTablesService } from './airtable-tables.service';
import { AirtableRecordsService } from './airtable-records.service';
import { AirtableRevisionsService } from './airtable-revisions.service';
import { AirtableScraperAuthService } from './airtable-scraper-auth.service';
import { AirtableSyncDialogComponent } from '../components/airtable-sync-dialog/airtable-sync-dialog.component';
import { AirtableCredentialsDialogComponent } from '../components/airtable-credentials-dialog/airtable-credentials-dialog.component';

/**
 * Orchestrates the post-auth Airtable data sync.
 * Sets a pending flag from the OAuth callback; the shell layout checks and runs it.
 */
@Injectable({ providedIn: 'root' })
export class AirtableSyncService {
	private readonly pendingSync = signal(false);

	private readonly dialog = inject(MatDialog);
	private readonly basesService = inject(AirtableBasesService);
	private readonly tablesService = inject(AirtableTablesService);
	private readonly recordsService = inject(AirtableRecordsService);
	private readonly revisionsService = inject(AirtableRevisionsService);
	private readonly usersService = inject(AirtableUsersService);
	private readonly scraperAuth = inject(AirtableScraperAuthService);

	/** Marks that a sync should run once the shell renders. */
	public markPendingSync(): void {
		this.pendingSync.set(true);
	}

	/** Forces a full sync immediately, bypassing the pending-flag check. */
	public triggerSync(): void {
		this.pendingSync.set(true);
		this.sync();
	}

	/** If a sync is pending, opens the dialog and runs the full sync chain. Safe to call multiple times. */
	public sync(): void {
		if (!this.pendingSync()) return;
		this.pendingSync.set(false);

		const dialogRef = this.dialog.open(AirtableSyncDialogComponent, {
			disableClose: true,
			width: '360px'
		});

		dialogRef.componentInstance.updateStatus('Fetching bases...');

		this.basesService
			.syncBases()
			.pipe(
				tap(() => dialogRef.componentInstance.updateStatus('Fetching tables...')),
				switchMap(() => this.tablesService.syncTables()),
				tap(() => dialogRef.componentInstance.updateStatus('Fetching records...')),
				switchMap(() => this.recordsService.syncRecords()),
				switchMap(() => this.ensureCookiesAndSyncScraperData(dialogRef)),
				tap(() => dialogRef.componentInstance.complete()),
				catchError(() => {
					dialogRef.componentInstance.fail('Sync failed. You can retry later.');
					return EMPTY;
				})
			)
			.subscribe();
	}

	/** Checks cookies, prompts for login if invalid, then syncs revisions and users. */
	private ensureCookiesAndSyncScraperData(dialogRef: MatDialogRef<AirtableSyncDialogComponent>) {
		return this.scraperAuth.checkCookieStatus().pipe(
			switchMap(status => {
				if (status.valid) return of(true);

				dialogRef.componentInstance.updateStatus('Airtable login required...');
				const credentialsRef = this.dialog.open(AirtableCredentialsDialogComponent, {
					disableClose: true,
					width: '400px'
				});
				return credentialsRef.afterClosed();
			}),
			switchMap(authenticated => {
				if (!authenticated) return of(null);

				dialogRef.componentInstance.updateStatus('Fetching revisions...');
				return this.revisionsService.syncRevisions().pipe(
					tap(() => dialogRef.componentInstance.updateStatus('Fetching users...')),
					switchMap(() => this.usersService.syncUsers())
				);
			}),
			catchError(() => of(null))
		);
	}
}
