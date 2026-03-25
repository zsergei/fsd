import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AUTH_API_PATHS } from '../../models/auth.constants';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-sign-in-page',
	imports: [MatButtonModule],
	templateUrl: './sign-in-page.component.html',
	styleUrl: './sign-in-page.component.scss',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPageComponent {
	public readonly appTitle = environment.appSettings.title;

	/**
	 * Starts Airtable OAuth (full browser navigation to API authorize URL).
	 */
	public signInWithAirtable(): void {
		globalThis.location.assign(`${environment.appEnv.apiBaseUrl}${AUTH_API_PATHS.AIRTABLE_AUTHORIZE}`);
	}
}
