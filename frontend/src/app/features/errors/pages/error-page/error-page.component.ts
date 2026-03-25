import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { getErrorCatalogEntry } from '../../utils/errors.utils';
import { ErrorPageNavigationState } from '../../models/errors.interfaces';

@Component({
	selector: 'app-error-page',
	imports: [MatButtonModule, MatIconModule, RouterLink],
	templateUrl: './error-page.component.html',
	styleUrl: './error-page.component.scss',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPageComponent {
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	public readonly code = signal(this.route.snapshot.paramMap.get('code') ?? 'unknown');

	private readonly fragmentDetail = signal<string | undefined>(undefined);
	private readonly stateDetail = signal<string | undefined>(undefined);

	public readonly entry = computed(() => getErrorCatalogEntry(this.code()));

	public readonly extraMessage = computed(() => this.fragmentDetail() ?? this.stateDetail());

	/**
	 * Initializes the error page component by extracting the error message from the fragment and the state.
	 */
	public constructor() {
		const fragment = this.route.snapshot.fragment ?? '';
		const errorFromHash = new URLSearchParams(fragment).get('error') ?? undefined;
		this.fragmentDetail.set(errorFromHash);

		const nav = this.router.getCurrentNavigation();
		const state = nav?.extras?.state as ErrorPageNavigationState | undefined;
		this.stateDetail.set(state?.detail);
	}
}
