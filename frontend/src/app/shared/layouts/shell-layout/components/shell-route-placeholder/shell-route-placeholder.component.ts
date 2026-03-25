import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type Data } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { getShellPageLabelFromRouteData } from '../../utils/shell.utils';

@Component({
	selector: 'app-shell-route-placeholder',
	standalone: true,
	templateUrl: './shell-route-placeholder.component.html',
	styleUrl: './shell-route-placeholder.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellRoutePlaceholderComponent {
	private readonly route = inject(ActivatedRoute);

	public readonly heading = toSignal(this.route.data.pipe(map(data => this.titleFromData(data))), {
		initialValue: this.titleFromData(this.route.snapshot.data)
	});

	private titleFromData(data: Data): string {
		return getShellPageLabelFromRouteData(data) ?? 'Page';
	}
}
