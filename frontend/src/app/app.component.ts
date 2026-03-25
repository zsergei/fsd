import { RouterOutlet } from '@angular/router';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	template: `<router-outlet></router-outlet>`,
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
