import { MatCardModule } from '@angular/material/card';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-dashboard-page',
	standalone: true,
	imports: [MatCardModule],
	templateUrl: './dashboard-page.component.html',
	styleUrl: './dashboard-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
	public readonly sections = [
		{
			body: 'Connect Airtable with OAuth and keep bases, tables, records, and users in sync with MongoDB.',
			title: 'Integrations'
		},
		{
			body: 'Pick a synced collection, search across fields, and explore rows in AG Grid with filters and sorting.',
			title: 'Data workspace'
		},
		{
			body: 'Drive revision history scraping with session cookies, validity checks, and MFA when required.',
			title: 'Sync & revision'
		}
	] as const;
}
