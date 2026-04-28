import { InjectionToken } from "@angular/core";
import { TableModel } from "../searchable-display/table-model";
import { UserData } from "./user";
import { USER_COLUMN_DEFINITIONS_OPTIONS, USER_COLUMN_DEFS_BASE, USER_COLUMN_DEFS_FULL } from "./user-column-defs";

export const USER_BASE_TABLE_MODEL_FULL = new InjectionToken<TableModel<UserData>>('USER_BASE_TABLE_MODEL_FULL', {
  providedIn: 'root',
  factory: () => {
    var model = new TableModel<UserData>();
    return {
        ...model,
        rowIdentifier: (row) => row.id.toString(),
        dataColumns: USER_COLUMN_DEFS_FULL,
        dataColumnVisibility: {
            allowShowAll: true,
            allowHideAll: true,
            baseColumns: USER_COLUMN_DEFS_BASE,
            visibilityGroups: USER_COLUMN_DEFINITIONS_OPTIONS,
            defaultVisibilityGroup: 'all',
        },
        globalSearchable: true,
        pagination: {
            pageSizeOptions: [3, 5, 10, 13],
            pageButtons: ['all'],
        },
    } as TableModel<UserData>;
  },
});

export const USER_BASE_TABLE_MODEL_PLAIN = new InjectionToken<TableModel<UserData>>('USER_BASE_TABLE_MODEL_PLAIN', {
  providedIn: 'root',
  factory: () => {
    var model = new TableModel<UserData>();
    return {
        ...model,
        dataColumns: USER_COLUMN_DEFS_BASE,
    } as TableModel<UserData>;
  },
});