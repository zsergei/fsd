import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { SidenavLink } from '../../models/shell-layout.interfaces';
import { environment } from '../../../../../../environments/environment';
import { AuthLogoutService } from '../../../../../features/auth/services/auth-logout.service';
import { AuthSessionService } from '../../../../../features/auth/services/auth-session.service';

@Component({
	selector: 'app-shell-sidenav',
	standalone: true,
	imports: [MatIconModule, MatListModule, RouterLink, RouterLinkActive],
	templateUrl: './shell-sidenav.component.html',
	styleUrl: './shell-sidenav.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'shell-sidenav' }
})
export class ShellSidenavComponent {
	private readonly authLogoutService = inject(AuthLogoutService);
	private readonly sessionService = inject(AuthSessionService);

	public readonly mainNavItems = input.required<readonly SidenavLink[]>();
	public readonly bottomNavItems = input.required<readonly SidenavLink[]>();
	public readonly syncRequested = output<void>();
	public readonly appTitle = environment.appSettings.title;
	public readonly userEmail = computed(() => this.sessionService.profile()?.airtableUserEmail);

	/** Emits a sync request to the parent shell layout. */
	public requestSync(): void {
		this.syncRequested.emit();
	}

	/** Logs out the user by calling the auth logout service. */
	public signOut(): void {
		this.authLogoutService.logout();
	}
}
