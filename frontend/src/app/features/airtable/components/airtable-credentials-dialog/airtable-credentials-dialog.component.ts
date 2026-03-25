import { catchError, EMPTY, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { DialogStep } from '../../models/airtable.types';
import { LoginSseEvent } from '../../models/airtable.interfaces';
import { AirtableScraperAuthService } from '../../services/airtable-scraper-auth.service';

@Component({
	selector: 'app-airtable-credentials-dialog',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatProgressBarModule,
		MatProgressSpinnerModule
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './airtable-credentials-dialog.component.html',
	styleUrl: './airtable-credentials-dialog.component.scss'
})
export class AirtableCredentialsDialogComponent {
	public readonly step = signal<DialogStep>('credentials');
	public readonly loading = signal(false);
	public readonly errorMessage = signal('');
	public readonly progressSteps = signal<string[]>([]);

	public readonly emailControl = new FormControl('', [Validators.required, Validators.email]);
	public readonly passwordControl = new FormControl('', [Validators.required]);
	public readonly mfaCodeControl = new FormControl('', [Validators.required]);

	private readonly dialogRef = inject(MatDialogRef<AirtableCredentialsDialogComponent>);
	private readonly scraperAuth = inject(AirtableScraperAuthService);

	private sessionId = '';

	/** Sends email and password to the scraper login endpoint with SSE progress. */
	public onSubmitCredentials(): void {
		if (this.emailControl.invalid || this.passwordControl.invalid) return;

		this.loading.set(true);
		this.errorMessage.set('');
		this.progressSteps.set([]);
		this.step.set('progress');

		this.scraperAuth
			.login({ email: this.emailControl.value!, password: this.passwordControl.value! })
			.pipe(
				tap(event => this.handleLoginEvent(event)),
				catchError(() => {
					this.loading.set(false);
					this.errorMessage.set('Authorization failed. Please check your email and password.');
					this.step.set('credentials');
					return EMPTY;
				})
			)
			.subscribe();
	}

	/** Sends the MFA code to complete the login session. */
	public onSubmitMfa(): void {
		if (this.mfaCodeControl.invalid) return;

		this.loading.set(true);
		this.errorMessage.set('');
		this.scraperAuth
			.submitMfa({ sessionId: this.sessionId, code: this.mfaCodeControl.value! })
			.pipe(
				tap(() => {
					this.loading.set(false);
					this.step.set('success');
					setTimeout(() => this.dialogRef.close(true), 600);
				}),
				catchError(() => {
					this.loading.set(false);
					this.errorMessage.set('MFA verification failed. Enter a new code and try again.');
					this.mfaCodeControl.setValue('');
					return EMPTY;
				})
			)
			.subscribe();
	}

	/** Closes the dialog without completing login. */
	public onSkip(): void {
		this.dialogRef.close(false);
	}

	/** Handles login events from the scraper SSE stream. */
	private handleLoginEvent(event: LoginSseEvent): void {
		if ('step' in event) {
			this.progressSteps.update(steps => [...steps, event.step]);
			return;
		}

		this.loading.set(false);

		if (event.type === 'error') {
			this.errorMessage.set(event.message);
			this.step.set('credentials');
			return;
		}

		if (event.status === 'mfa_required') {
			this.sessionId = event.sessionId;
			this.step.set('mfa');
		} else {
			this.progressSteps.update(steps => [...steps, 'Done!']);
			setTimeout(() => this.dialogRef.close(true), 800);
		}
	}
}
