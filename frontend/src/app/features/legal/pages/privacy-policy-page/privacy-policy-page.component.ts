import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-privacy-policy-page',
	standalone: true,
	templateUrl: './privacy-policy-page.component.html',
	styleUrl: './privacy-policy-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyPageComponent {}
