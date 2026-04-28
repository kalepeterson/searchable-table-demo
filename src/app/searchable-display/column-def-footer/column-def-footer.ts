import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { SearchableDisplayState } from '../searchable-display-state';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, merge } from 'rxjs';
import { ColumnSearchTerm } from '../table-model';

@Component({
  selector: 'tfoot[sd-column-def-footer]',
  imports: [ReactiveFormsModule],
  template: `
    @let tstate = this.tableStateService.tableState();
    @if (tstate) {
      <tr>
        @for (skip of startActionColumnSkips(); track skip) {
          <td></td>
        }
        @for (columnDef of tstate.visibleColumns; track columnDef) {
          <td>
            @if (columnDef.searchable) {
              @let controlMapping = columnSearchControls().find(c => c.header === columnDef.header);
              @if (controlMapping) {
                <input
                  type="search"
                  placeholder="Search column..."
                  [formControl]="controlMapping.control"
                />
              }
            }
          </td>
        }
        @for (skip of endActionColumnSkips(); track skip) {
          <td></td>
        }
      </tr>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnDefFooter {
  protected readonly tableStateService = inject(SearchableDisplayState);

  protected readonly startActionColumnSkips = computed(() => {
    const tmodel = this.tableStateService.tableModel();
    if (tmodel?.actionColumns) {
      const numStartActions = tmodel.actionColumns.filter(ac => ac.columnLocation === 'start').length;
      return [...Array(numStartActions).keys()];
    }
    return [];
  });

    protected readonly endActionColumnSkips = computed(() => {
    const tmodel = this.tableStateService.tableModel();
    if (tmodel?.actionColumns) {
      const numEndActions = tmodel.actionColumns.filter(ac => ac.columnLocation === 'end').length;
      return [...Array(numEndActions).keys()];
    }
    return [];
  });

  protected readonly columnSearchControls = computed(() => {
    const tmodel = this.tableStateService.tableModel();
    if (tmodel) {
      const searchControls = tmodel.dataColumns
        .filter((colDef) => colDef.searchable)
        .map((colDef) => {
          return {
            header: colDef.header,
            control: new FormControl<string | null>(''),
          };
        });
      return searchControls;
    }
    return [];
  });

  constructor() {
    effect(() => {
      merge(...this.columnSearchControls()
        .map((controlMapping) => {
          const { header, control } = controlMapping;
          return control.valueChanges.pipe(
            debounceTime(300),
            map((value) => {
              return {
                columnHeader: header,
                searchTerm: value ?? '',
              } as ColumnSearchTerm;
            }),
          );
        }),
      ).subscribe((columnSearchTerm) => {
        this.tableStateService.updateColumnSearchTerm(columnSearchTerm);
      });
    });
  }
}