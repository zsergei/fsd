import { RouterOutlet } from '@angular/router';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PublicHeaderComponent } from '../components/public-header/public-header.component';

@Component({
	selector: 'app-public-layout',
	standalone: true,
	imports: [PublicHeaderComponent, RouterOutlet],
	templateUrl: './public-layout.component.html',
	styleUrl: './public-layout.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicLayoutComponent {}
