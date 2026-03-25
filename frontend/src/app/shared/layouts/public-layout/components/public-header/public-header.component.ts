import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-public-header',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './public-header.component.html',
	styleUrl: './public-header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicHeaderComponent {
	public readonly appTitle = environment.appSettings.title;
}
