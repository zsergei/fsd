import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

@Component({
	selector: 'app-airtable-sync-dialog',
	standalone: true,
	imports: [MatDialogModule, MatIconModule, MatProgressBarModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './airtable-sync-dialog.component.html',
	styleUrl: './airtable-sync-dialog.component.scss'
})
export class AirtableSyncDialogComponent {
	public readonly done = signal(false);
	public readonly statusMessage = signal('Syncing...');

	private readonly dialogRef = inject(MatDialogRef<AirtableSyncDialogComponent>);

	public readonly progressValue = computed(() => (this.done() ? 100 : 0));
	public readonly progressMode = computed(() => (this.done() ? 'determinate' : 'indeterminate'));

	/** Updates the status message without closing the dialog. */
	public updateStatus(message: string): void {
		this.statusMessage.set(message);
	}

	/** Marks sync as complete and auto-closes after a short delay. */
	public complete(): void {
		this.statusMessage.set('Done!');
		this.done.set(true);
		setTimeout(() => this.dialogRef.close(), 600);
	}

	/** Marks sync as failed and auto-closes after a short delay. */
	public fail(message: string): void {
		this.statusMessage.set(message);
		this.done.set(true);
		setTimeout(() => this.dialogRef.close(), 1500);
	}
}
