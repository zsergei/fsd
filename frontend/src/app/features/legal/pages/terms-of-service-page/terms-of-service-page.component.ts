import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-terms-of-service-page',
	standalone: true,
	templateUrl: './terms-of-service-page.component.html',
	styleUrl: './terms-of-service-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsOfServicePageComponent {}
