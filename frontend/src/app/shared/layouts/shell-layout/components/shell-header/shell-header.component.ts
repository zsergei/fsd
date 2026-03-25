import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { Breadcrumb } from '../../models/shell-layout.interfaces';

@Component({
	selector: 'app-shell-header',
	standalone: true,
	imports: [MatIconModule, RouterLink],
	templateUrl: './shell-header.component.html',
	styleUrl: './shell-header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellHeaderComponent {
	public readonly isHandset = input.required<boolean>();
	public readonly drawerOpened = input.required<boolean>();
	public readonly breadcrumbs = input.required<readonly Breadcrumb[]>();
	public readonly drawerId = input<string>('shell-drawer');
	public readonly toggleDrawer = output<void>();
}
