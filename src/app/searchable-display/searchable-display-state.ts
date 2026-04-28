import { Injectable, signal } from '@angular/core';
import { ColumnDefinition, ColumnSearchTerm, TableModel, TableState, TableStyleDefinition } from './table-model';

@Injectable()
export class SearchableDisplayState {
  tableState = signal<TableState | undefined>(undefined);
  tableModel = signal<TableModel | undefined>(undefined);
  tableStyles = signal<TableStyleDefinition | undefined>(undefined);

  initializeTableState(tableModel: TableModel): void {
    this.tableModel.set(tableModel);
    let nextState: TableState = {
      data: [],
      displayedData: [],
      filteredData: [],
      visibleColumns: [],
      currentPage: undefined,
      pageSize: undefined,
    };
    nextState.visibleColumns = this.determineVisibleColumns(nextState);
    nextState.currentPage = tableModel.pagination ? 1 : undefined;
    nextState.pageSize = tableModel.pagination?.pageSizeOptions?.[0] ?? undefined;
    this.tableState.set(nextState);
  }

  setTableStyles(tableStyles: TableStyleDefinition): void {
    this.tableStyles.set(tableStyles);
  }

  patchDataRows(dataRows: any[]): void {
    const currentState = this.tableState();
    if (currentState) {
      const nextState = {
        ...currentState,
        data: [...dataRows],
      };
      this.runDataPipeline(nextState);
    }
  }

  globalQuery(query: string | null | undefined): void {
    const queryString = query ?? '';
    if (this.tableState() && this.tableState()?.globalSearchTerm !== queryString) {
      const nextState = {
        ...this.tableState()!,
        globalSearchTerm: queryString,
      };
      this.runDataPipeline(nextState);
    }
  }

  updateColumnSearchTerm(columnSearchTerm: ColumnSearchTerm): void {
    const tableStateRef = this.tableState();
    if (tableStateRef) {
      const existingTerms = tableStateRef.columnSearchTerms ?? [];
      const existingTermIndex = existingTerms.findIndex(
        (term) => term.columnHeader === columnSearchTerm.columnHeader,
      );
      if (existingTermIndex !== -1) {
        existingTerms[existingTermIndex] = columnSearchTerm;
      } else {
        existingTerms.push(columnSearchTerm);
      }
      const nextState = {
        ...tableStateRef,
        columnSearchTerms: existingTerms,
      };
      this.runDataPipeline(nextState);
    }
  }

  setVisibilityGroup(groupName: string): void {
    var currentState = this.tableState();
    if (currentState && currentState.visibilityGroup !== groupName) {
      const nextState = {
        ...currentState,
        visibilityGroup: groupName,
      };
      this.runDataPipeline(nextState);
    }
  }

  sortColumn(columnDef: ColumnDefinition): void {
    const tstate = this.tableState();
    if (tstate && columnDef.sortable) {
      let nextSortDirection: 'asc' | 'desc' = 'asc';
      if (tstate.sortColumn === columnDef.header) {
        nextSortDirection = tstate.sortDirection === 'asc' ? 'desc' : 'asc';
      }

      const nextState = {
        ...tstate,
        sortColumn: columnDef.header,
        sortDirection: nextSortDirection,
      };
      this.runDataPipeline(nextState);
    }
  }

  pageChanged(newPage: number): void {
    const tstate = this.tableState();
    if (tstate && tstate.currentPage !== newPage) {
      const nextState = {
        ...tstate,
        currentPage: newPage,
      };
      this.runDataPipeline(nextState);
    }
  }

  updatePageSize(newPageSize: number): void {
    const tstate = this.tableState();
    if (tstate && tstate.pageSize !== newPageSize) {
      const nextState = {
        ...tstate,
        pageSize: newPageSize,
      };
      this.runDataPipeline(nextState);
    }
  }

  private runDataPipeline(updatedState: TableState): void {
    let currentState = this.tableState() ?? ({} as TableState);
    let tableModel = this.tableModel();
    if (!tableModel) {
      return;
    }

    const visibleColumns = this.determineVisibleColumns(updatedState);
    let filteredData = [...updatedState.data];

    let globalSearchValue = updatedState.globalSearchTerm ?? currentState.globalSearchTerm ?? '';
    if (globalSearchValue) {
      filteredData = this.queryDisplayedColumns(filteredData, visibleColumns, globalSearchValue);
    }

    let columnSearchTermsObj = updatedState.columnSearchTerms ?? currentState.columnSearchTerms;
    if (columnSearchTermsObj) {
      for (let columnSearchTerm of columnSearchTermsObj) {
        let columnDef = visibleColumns.find((col) => col.header === columnSearchTerm.columnHeader);
        if (columnDef && columnSearchTerm.searchTerm) {
          filteredData = this.queryIndividualColumn(
            filteredData,
            columnDef,
            columnSearchTerm.searchTerm,
          );
        }
      }
    }

    const sortColumn = updatedState.sortColumn ?? currentState.sortColumn;
    const sortDirection = updatedState.sortDirection ?? currentState.sortDirection;
    const sortColumnDef = visibleColumns.find((col) => col.header === sortColumn);
    if (sortColumnDef && sortDirection) {
      filteredData.sort((a, b) => {
        const aValue = sortColumnDef.valueDisplayMapper(a);
        const bValue = sortColumnDef.valueDisplayMapper(b);
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : comparison * -1;
      });
    }

    const paginationOptions = tableModel.pagination;
    const pageSize =
      updatedState.pageSize ??
      currentState.pageSize ??
      paginationOptions?.pageSizeOptions?.[0] ??
      undefined;
    const currentPage =
      updatedState.currentPage ?? currentState.currentPage ?? (paginationOptions ? 1 : undefined);
    let updatedPage = currentPage;
    if (paginationOptions && pageSize && updatedPage) {
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      if (updatedPage > totalPages) {
        updatedPage = totalPages;
      }
      if (updatedPage < 1) {
        updatedPage = 1;
      }
    }
    const displayedData = this.paginateData(filteredData, updatedPage, pageSize);

    this.tableState.set({
      ...currentState,
      data: updatedState.data,
      visibilityGroup: updatedState.visibilityGroup,
      visibleColumns,
      displayedData,
      filteredData,
      globalSearchTerm: globalSearchValue,
      columnSearchTerms: columnSearchTermsObj,
      sortColumn,
      sortDirection,
      pageSize: pageSize,
      currentPage: updatedPage,
    });
  }

  private paginateData(data: any[], currentPage?: number, pageSize?: number): any[] {
    if (currentPage && pageSize) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      data = data.slice(startIndex, endIndex);
    }
    return data;
  }

  private queryDisplayedColumns(data: any[], columns: ColumnDefinition[], query: string): any[] {
    return data.filter((row) => {
      for (let visibleColDef of columns) {
        if (this.matchCell(row, visibleColDef, query)) {
          return true;
        }
      }
      return false;
    });
  }

  private queryIndividualColumn(data: any[], column: ColumnDefinition, query: string): any[] {
    return data.filter((row) => {
      return this.matchCell(row, column, query);
    });
  }

  private matchCell(row: any, column: ColumnDefinition, query: string): boolean {
    let cellValue = column.valueDisplayMapper(row);
    return cellValue.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  }

  private determineVisibleColumns(tableState: TableState): ColumnDefinition[] {
    let tableModel = this.tableModel();
    if (!tableState || !tableModel) {
      return [];
    }
    const visibilityGroup =
      tableState.visibilityGroup ??
      (tableModel.dataColumnVisibility?.defaultVisibilityGroup || 'all');
    if (!tableModel.dataColumnVisibility || visibilityGroup === 'all') {
      return tableModel.dataColumns || [];
    }
    if (visibilityGroup === 'none') {
      return tableModel.dataColumnVisibility!.baseColumns ?? tableModel.dataColumns ?? [];
    }

    const { baseColumns, visibilityGroups } = tableModel.dataColumnVisibility ?? {};
    if (visibilityGroups && visibilityGroups[visibilityGroup]) {
      return [...baseColumns, ...visibilityGroups[visibilityGroup]];
    }
    return baseColumns;
  }
}
