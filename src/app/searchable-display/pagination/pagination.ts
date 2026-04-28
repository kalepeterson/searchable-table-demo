import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { SearchableDisplayState } from '../searchable-display-state';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { TableStyleDefinition } from '../table-model';

@Component({
  selector: 'sd-pagination',
  imports: [ReactiveFormsModule],
  template: `
    @let tstate = this.tableState();
    @let tmodel = this.tableModel();
    @if (tstate && tmodel && tmodel.pagination) {
      <form [formGroup]="paginationForm">
        <fieldset role="group" aria-label="Pagination controls">
          @for (startBtn of startButtons(); track startBtn.buttonText) {
            <button type="button" (click)="startBtn.clickAction()">
              {{ startBtn.buttonText }}
            </button>
          }
          @for (numBtn of pageNumberButtons(); track numBtn.buttonText) {
            <button
              type="button"
              [classList]="numBtn.classList"
              (click)="numBtn.clickAction()"
            >
              {{ numBtn.buttonText }}
            </button>
          }
          @for (endBtn of endButtons(); track endBtn.buttonText) {
            <button type="button" (click)="endBtn.clickAction()">
              {{ endBtn.buttonText }}
            </button>
          }
        </fieldset>
        @if (tmodel.pagination.pageSizeOptions && tmodel.pagination.pageSizeOptions.length > 1) {
          <fieldset role="group" aria-label="Page size selection">
            @if (tableStyles()?.paginationClasses?.showPageSizeLabel) {
              <legend>Page Size</legend>
            } 
            <select formControlName="pageSizeDropdown" [classList]="tableStyles()?.paginationClasses?.pageSizeDropdownClasses">
              @for (sizeOption of tmodel.pagination.pageSizeOptions; track sizeOption) {
                <option value="{{ sizeOption }}">
                  {{ sizeOption }}
                </option>
              }
            </select>
          </fieldset>
        }
      </form>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Pagination {
  protected readonly tableStateService = inject(SearchableDisplayState);
  protected readonly tableModel = this.tableStateService.tableModel;
  protected readonly tableState = this.tableStateService.tableState;
  protected readonly tableStyles = this.tableStateService.tableStyles;

  protected readonly paginationForm = inject(FormBuilder).group({
    pageSizeDropdown: [''],
  });

  protected readonly selectedPageSizeRawValue = toSignal(
    this.paginationForm.controls.pageSizeDropdown.valueChanges.pipe(
      switchMap((value) => {
        return [value];
      }),
    ),
    {
      initialValue: '',
    },
  );

  protected readonly currentPageSize = linkedSignal(() => {
    const selectedPageSize = this.selectedPageSizeRawValue();
    if (selectedPageSize) {
      return Number(selectedPageSize);
    }
    if (this.tableState()?.pageSize) {
      return this.tableState()!.pageSize!;
    }
    if (this.tableModel()?.pagination?.pageSizeOptions?.length) {
      return this.tableModel()!.pagination!.pageSizeOptions![0];
    }
    return undefined;
  });

  protected readonly currentPage = computed(() => {
    return this.tableState()?.currentPage ?? 1;
  });

  protected readonly pageNumbers = computed(() => {
    const tstate = this.tableState();
    const tmodel = this.tableModel();
    if (tstate && tmodel && tmodel.pagination) {
      const pageSize = this.currentPageSize();
      if (pageSize) {
        const totalItems = tstate.filteredData.length ?? 0;
        const totalPages = Math.ceil(totalItems / pageSize);
        return [...Array(totalPages).keys()].map((i) => i + 1);
      }
    }
    return [];
  });

  protected readonly lastPageNumber = computed(() => {
    const pageNums = this.pageNumbers();
    if (pageNums.length > 0) {
      return pageNums[pageNums.length - 1];
    }
    return undefined;
  });

  protected readonly pageNumberButtons = computed(() => {
    const tstate = this.tableState();
    const pageNums = this.pageNumbers();
    if (tstate && pageNums.length > 0) {
      return pageNums.map((pageNum) => {
        return {
          buttonText: pageNum.toString(),
          clickAction: () => {
            this.tableStateService.pageChanged(pageNum);
          },
          classList: this.pageNumberButtonClass(this.tableStyles(), this.currentPage(), pageNum),
        };
      });
    }
    return [];
  });

  protected readonly startButtons = computed(() => {
    const tmodel = this.tableModel();
    const tstate = this.tableState();
    const paginationOptions = tmodel?.pagination;
    if (tmodel && tstate && paginationOptions) {
      let pageButtonDefs: PageButton[] = [];
      const pageButtons = paginationOptions.pageButtons;
      pageButtonDefs = pageButtonDefs.concat(
        this.handleFirstButton(pageButtons),
        this.handlePreviousButton(pageButtons),
      );
      return pageButtonDefs;
    }
    return [];
  });

  protected readonly endButtons = computed(() => {
    const tmodel = this.tableModel();
    const tstate = this.tableState();
    const paginationOptions = tmodel?.pagination;
    if (tmodel && tstate && paginationOptions) {
      let pageButtonDefs: PageButton[] = [];
      const pageButtons = paginationOptions.pageButtons;
      pageButtonDefs = pageButtonDefs.concat(
        this.handleNextButton(pageButtons),
        this.handleLastButton(pageButtons),
      );
      return pageButtonDefs;
    }
    return [];
  });

  protected pageNumberButtonClass(tableStyles: TableStyleDefinition | undefined, currentPage: number, buttonNumber: number): string {
    const selected = currentPage === buttonNumber;
    if (selected && tableStyles?.paginationClasses?.activePageButtonClasses) {
      return tableStyles?.paginationClasses?.activePageButtonClasses ?? '';
    }
    return (tableStyles?.paginationClasses?.pageButtonClasses ?? '');
  }

  private handleFirstButton(pageButtons: string[]): PageButton[] {
    if (pageButtons.includes('first-last') || pageButtons.includes('all')) {
      return [
        {
          buttonText: 'First',
          clickAction: () => {
            this.tableStateService.pageChanged(1);
          },
        },
      ];
    }
    return [];
  }

  private handleLastButton(pageButtons: string[]): PageButton[] {
    if (pageButtons.includes('first-last') || pageButtons.includes('all')) {
      return [
        {
          buttonText: 'Last',
          clickAction: () => {
            this.tableStateService.pageChanged(this.lastPageNumber() ?? 1);
          },
        },
      ];
    }
    return [];
  }

  private handleNextButton(pageButtons: string[]): PageButton[] {
    if (pageButtons.includes('next-previous') || pageButtons.includes('all')) {
      return [
        {
          buttonText: 'Next',
          clickAction: () => {
            const currentPage = this.tableStateService.tableState()?.currentPage ?? 1;
            const lastPage = this.lastPageNumber() ?? 1;
            if (currentPage < lastPage) {
              this.tableStateService.pageChanged(currentPage + 1);
            }
          },
        },
      ];
    }
    return [];
  }

  private handlePreviousButton(pageButtons: string[]): PageButton[] {
    if (pageButtons.includes('next-previous') || pageButtons.includes('all')) {
      return [
        {
          buttonText: 'Previous',
          clickAction: () => {
            const currentPage = this.tableStateService.tableState()?.currentPage ?? 1;
            if (currentPage > 1) {
              this.tableStateService.pageChanged(currentPage - 1);
            }
          },
        },
      ];
    }
    return [];
  }

  constructor() {
    effect(() => {
      const pageSize = this.currentPageSize();
      if (pageSize && pageSize > 0) {
        this.paginationForm.patchValue(
          { pageSizeDropdown: pageSize.toString() },
          { emitEvent: false },
        );
        this.tableStateService.updatePageSize(pageSize);
      }
    });
  }
}

interface PageButton {
  buttonText: string;
  clickAction: () => void;
}
