import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
	readonly title: string;
	readonly message: string;
	readonly confirmLabel?: string;
	readonly cancelLabel?: string;
}

@Component({
	selector: 'app-confirm-dialog',
	standalone: true,
	imports: [MatDialogModule, MatButtonModule],
	templateUrl: './confirm-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
	public readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

	private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

	/** Closes the dialog with `true` (confirmed). */
	public confirm(): void {
		this.dialogRef.close(true);
	}

	/** Closes the dialog with `false` (cancelled). */
	public cancel(): void {
		this.dialogRef.close(false);
	}
}
