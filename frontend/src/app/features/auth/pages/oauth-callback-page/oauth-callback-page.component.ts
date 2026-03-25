import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { AuthTokenStorageService } from '../../services/auth-token-storage.service';
import { AUTH_ROUTE_PATHS, OAUTH_FRAGMENT_PARAMS } from '../../models/auth.constants';
import { AirtableSyncService } from '../../../airtable/services/airtable-sync.service';

@Component({
	selector: 'app-oauth-callback-page',
	templateUrl: './oauth-callback-page.component.html',
	styleUrl: './oauth-callback-page.component.scss',
	imports: [MatProgressSpinnerModule],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OAuthCallbackPageComponent implements OnInit {
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);
	private readonly tokenStorage = inject(AuthTokenStorageService);
	private readonly airtableSyncService = inject(AirtableSyncService);

	/**
	 * Handles OAuth return: reads access token from URL fragment; refresh is httpOnly cookie from API redirect.
	 * Backend redirects as `/auth/oauth-callback#access_token=...`.
	 */
	public ngOnInit(): void {
		const params = new URLSearchParams(this.route.snapshot.fragment ?? '');
		const accessToken = params.get(OAUTH_FRAGMENT_PARAMS.ACCESS_TOKEN);

		if (accessToken && !params.has(OAUTH_FRAGMENT_PARAMS.ERROR)) {
			this.tokenStorage.setAccessToken(accessToken);
			this.airtableSyncService.markPendingSync();
			void this.router.navigate([AUTH_ROUTE_PATHS.DASHBOARD]);
			return;
		}

		void this.router.navigate([AUTH_ROUTE_PATHS.SIGN_IN]);
	}
}
