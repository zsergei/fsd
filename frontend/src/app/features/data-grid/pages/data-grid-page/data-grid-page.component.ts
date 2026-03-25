import { finalize } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';

import type { CollectionId } from '../../models/data-grid.types';

import { DataGridService } from '../../services/data-grid.service';
import { COLLECTIONS, EXCLUDED_GRID_KEYS } from '../../models/data-grid.constants';

@Component({
	selector: 'app-data-grid-page',
	standalone: true,
	imports: [AgGridAngular, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule, MatProgressBarModule],
	templateUrl: './data-grid-page.component.html',
	styleUrl: './data-grid-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridPageComponent {
	readonly collections = COLLECTIONS;

	readonly loading = signal(false);
	readonly quickFilterText = signal('');
	readonly columnDefs = signal<ColDef[]>([]);
	readonly rowData = signal<Record<string, unknown>[]>([]);
	readonly selectedCollection = signal<CollectionId | null>(null);

	private readonly dataGridService = inject(DataGridService);

	readonly defaultColDef: ColDef = {
		filter: true,
		sortable: true,
		resizable: true,
		minWidth: 120,
		cellDataType: false,
		valueFormatter: params => {
			const val = params.value;
			if (val === null || val === undefined) return '';
			if (typeof val === 'object') return Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
			return String(val);
		}
	};

	readonly isGridReady = computed(() => this.selectedCollection() !== null);

	/** Initializes the component and sets up the collection data loading effect. */
	constructor() {
		effect(() => {
			const collection = this.selectedCollection();
			untracked(() => {
				this.rowData.set([]);
				this.columnDefs.set([]);
				if (!collection) return;

				this.loading.set(true);
				this.dataGridService
					.getCollection(collection)
					.pipe(finalize(() => this.loading.set(false)))
					.subscribe({
						next: rows => {
							this.columnDefs.set(this.buildColumnDefs(rows));
							this.rowData.set(rows);
						},
						error: () => {}
					});
			});
		});
	}

	/** Updates the quick filter text from an input event. */
	public onSearchInput(event: Event): void {
		this.quickFilterText.set((event.target as HTMLInputElement).value);
	}

	/** Derives column definitions from the keys of the first row, excluding internal fields. */
	private buildColumnDefs(rows: Record<string, unknown>[]): ColDef[] {
		if (rows.length === 0) return [];
		return Object.keys(rows[0])
			.filter(key => !EXCLUDED_GRID_KEYS.has(key))
			.map(key => ({ field: key, headerName: key }));
	}
}
