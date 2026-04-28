import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { TableModel, TableStyleDefinition } from './table-model';
import { ColumnDefHeaders } from './column-def-headers/column-def-headers';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ColumnDefBody } from './column-def-body/column-def-body';
import { SearchableDisplayState } from './searchable-display-state';
import { ColumnDefFooter } from './column-def-footer/column-def-footer';
import { debounceTime, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import Pagination from './pagination/pagination';

@Component({
  selector: 'sd-searchable-display',
  imports: [ReactiveFormsModule, ColumnDefHeaders, ColumnDefBody, ColumnDefFooter, Pagination],
  providers: [SearchableDisplayState],
  template: `
    <form [formGroup]="displayForm">
      @if (title()) {
        <header>{{ title() }}</header>
      }
      @if (tableModel().globalSearchable) {
        <input type="search" placeholder="Search all columns..." formControlName="globalSearch" />
      }
      @if (visibilityGroupOptions().length > 0) {
        <select formControlName="visibilityGroup">
          @for (group of visibilityGroupOptions(); track group.display) {
            <option value="{{ group.value }}">
              {{ group.display }}
            </option>
          }
        </select>
      }
      <table [classList]="tableStyle()?.tableClasses">
        <thead [classList]="tableStyle()?.headerClasses" sd-column-def-headers></thead>
        <tbody [classList]="tableStyle()?.bodyClasses" sd-column-def-body></tbody>
        <tfoot [classList]="tableStyle()?.footerClasses" sd-column-def-footer></tfoot>
      </table>
      <sd-pagination></sd-pagination>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchableDisplay {
  tableModel = input.required<TableModel>();
  dataRows = input.required<any[]>();
  title = input<string>();
  tableStyle = input<TableStyleDefinition>();

  protected readonly tableStateService = inject(SearchableDisplayState);

  protected readonly displayForm = inject(FormBuilder).group({
    globalSearch: [''],
    visibilityGroup: [
      this.tableStateService.tableModel()?.dataColumnVisibility?.defaultVisibilityGroup ?? 'all',
    ],
  });

  protected readonly globalSearchValue = toSignal(
    this.displayForm.controls.globalSearch.valueChanges.pipe(
      debounceTime(300),
      switchMap((value) => {
        return [value];
      }),
    ),
    { initialValue: '' },
  );

  protected readonly visibilityGroupOptions = computed(() => {
    let specifiedGroups: { display: string; value: string }[] = [];
    let tableModel = this.tableModel();
    if (tableModel.dataColumnVisibility) {
      if (tableModel.dataColumnVisibility!.allowShowAll) {
        specifiedGroups.push({ display: 'Show All', value: 'all' });
      }
      if (tableModel.dataColumnVisibility!.allowHideAll) {
        specifiedGroups.push({ display: 'Hide All', value: 'none' });
      }
      for (let group of Object.entries(tableModel.dataColumnVisibility!.visibilityGroups ?? {})) {
        specifiedGroups.push({ display: group[0], value: group[0] });
      }
    }
    return specifiedGroups;
  });

  protected readonly currentVisibilitySet = toSignal(
    this.displayForm.controls.visibilityGroup.valueChanges,
  );

  protected readonly dataRowChangeDetected = computed(() => {
    const currentTableState = this.tableStateService.tableState();
    const tableModel = this.tableModel();
    const dataRows = this.dataRows();
    if (!currentTableState) {
      return false;
    }

    return dataRows.length !== currentTableState.data.length
      || dataRows.some((row, index) => tableModel.rowIdentifier(row) !== tableModel.rowIdentifier(currentTableState.data[index]));
  });

  constructor() {
    effect(() => {
      const tableState = this.tableStateService.tableState();
      if (!tableState) {
        this.tableStateService.initializeTableState(this.tableModel());
        this.tableStateService.patchDataRows(this.dataRows());
      } else if (this.dataRowChangeDetected()) {
        this.tableStateService.patchDataRows(this.dataRows());
      }
    });
    effect(() => {
      if (this.tableStyle()) {
        this.tableStateService.setTableStyles(this.tableStyle()!);
      }
    });
    effect(() => {
      let currentGlobalSearchValue = this.globalSearchValue() ?? '';
      this.tableStateService.globalQuery(currentGlobalSearchValue);
    });
    effect(() => {
      let currentVisibilityGroup = this.currentVisibilitySet();
      if (currentVisibilityGroup) {
        this.tableStateService.setVisibilityGroup(currentVisibilityGroup);
      }
    });
  }
}
