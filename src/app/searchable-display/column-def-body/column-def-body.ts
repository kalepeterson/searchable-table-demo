import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SearchableDisplayState } from '../searchable-display-state';
import { ActionButtonDefinition, ColumnDefinition } from '../table-model';

@Component({
	selector: 'tbody[sd-column-def-body]',
	imports: [],
	template: `
		@let tableState = this.tableState();
		@let tableModel = this.tableModel();
		@let actionCellClasses = this.actionCellClasses();
		@let cellClasses = this.cellClasses();
		@if (tableState && tableModel) {
			@for (row of tableState.displayedData; track row.id) {
				<tr>
					@for (actionColumn of startActions(); track actionColumn) {
						<td>
							@for (actionButton of actionColumn.actionButtonDefinitions; track actionButton) {
								<a href="#" role="button" (click)="actionButton.clickAction(row)()">{{ actionButton.buttonText }}</a>
							}
						</td>
					}
				@for (columnDef of tableState.visibleColumns; track columnDef) {
					<td [classList]="cellClasses(row, columnDef)">
						<span>{{ columnDef.valueDisplayMapper(row) }}</span>
						@let actionButtons = columnDef.cellActionButtons ?? [];
						@if (actionButtons.length > 0) {
							<fieldset>
								@for (actionButton of actionButtons; track actionButton) {
									<button type="button" [classList]="actionCellClasses(row, actionButton)" (click)="actionButton.clickAction(row)()">{{ actionButton.buttonText }}</button>
								}
							</fieldset>
						}
					</td>
				}
				@for (actionColumn of endActions(); track actionColumn) {
					<td>
						@for (actionButton of actionColumn.actionButtonDefinitions; track actionButton) {
							<button type="button" [classList]="actionCellClasses(row, actionButton)" (click)="actionButton.clickAction(row)()">{{ actionButton.buttonText }}</button>
						}
					</td>
				}
				</tr>
			}
		}
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnDefBody {
	protected readonly tableStateService = inject(SearchableDisplayState);
	protected readonly tableState = this.tableStateService.tableState;
	protected readonly tableModel = this.tableStateService.tableModel;
	protected readonly tableStyles = this.tableStateService.tableStyles;
	protected readonly startActions = computed(() => this.tableModel()?.actionColumns?.filter(ac => ac.columnLocation === 'start') ?? []);
	protected readonly endActions = computed(() => this.tableModel()?.actionColumns?.filter(ac => ac.columnLocation === 'end') ?? []);
	protected readonly actionCellClasses = computed(() => this.tableStyles()?.actionCellClasses ?? ((r : any, a : ActionButtonDefinition<any>) => ''));
	protected readonly cellClasses = computed(() => this.tableStyles()?.cellClasses ?? ((r : any, c : ColumnDefinition<any>) => ''));
}
