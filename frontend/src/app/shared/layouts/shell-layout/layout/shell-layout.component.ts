import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

import { readShellRouteData } from '../utils/shell.utils';
import { ShellHeaderComponent } from '../components/shell-header/shell-header.component';
import { ShellSidenavComponent } from '../components/shell-sidenav/shell-sidenav.component';
import { AirtableSyncService } from '../../../../features/airtable/services/airtable-sync.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
	selector: 'app-shell-layout',
	standalone: true,
	imports: [MatSidenavModule, MatDialogModule, ShellHeaderComponent, ShellSidenavComponent, RouterOutlet],
	templateUrl: './shell-layout.component.html',
	styleUrl: './shell-layout.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellLayoutComponent {
	public readonly drawerOpened = signal<boolean>(true);

	private readonly router = inject(Router);
	private readonly dialog = inject(MatDialog);
	private readonly breakpoint = inject(BreakpointObserver);
	private readonly airtableSyncService = inject(AirtableSyncService);

	constructor() {
		effect(() => {
			this.drawerOpened.set(!this.isHandset());
		});
		this.airtableSyncService.sync();
	}

	public readonly isHandset = toSignal(this.breakpoint.observe(Breakpoints.Handset).pipe(map(breakpointState => breakpointState.matches)), {
		initialValue: false
	});

	public readonly shellState = toSignal(
		this.router.events.pipe(
			filter((routerEvent): routerEvent is NavigationEnd => routerEvent instanceof NavigationEnd),
			map(() => readShellRouteData(this.router.routerState.snapshot.root))
		),
		{ initialValue: readShellRouteData(this.router.routerState.snapshot.root) }
	);

	public readonly mainNavItems = [
		{ icon: 'dashboard', id: 'dashboard', label: 'Dashboard', link: '/dashboard' },
		{ icon: 'table_chart', id: 'data-grid', label: 'Data grid', link: '/data-grid' }
	] as const;

	public readonly bottomNavItems = [
		{ icon: 'gavel', id: 'terms-of-service', label: 'Terms of service', link: '/legal/terms-of-service' },
		{ icon: 'policy', id: 'privacy-policy', label: 'Privacy policy', link: '/legal/privacy-policy' },
		{ icon: 'api', id: 'api-docs', label: 'API documentation', link: '/doc', external: true }
	] as const;

	/** Opens a confirmation dialog, then triggers a full Airtable sync if confirmed. */
	public onSyncRequested(): void {
		const ref = this.dialog.open(ConfirmDialogComponent, {
			width: '420px',
			data: {
				title: 'Synchronize Airtable data',
				message:
					'Frequent synchronizations may lead to API/IAPI rate limits or an IP / account ban from Airtable. Please wait at least a few minutes between syncs. Are you sure you want to run a full sync now?',
				confirmLabel: 'Synchronize',
				cancelLabel: 'Cancel'
			}
		});

		ref.afterClosed().subscribe((confirmed: boolean) => {
			if (confirmed) this.airtableSyncService.triggerSync();
		});
	}

	/** Toggles the sidenav drawer. */
	public toggleDrawer(): void {
		this.drawerOpened.update(open => !open);
	}
}
