import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchableDisplay } from './searchable-display/searchable-display';
import { UserPlaceholderService } from './services/user-placeholder';
import { TableModel, TableStyleDefinition } from './searchable-display/table-model';
import { UserData } from './models/user';
import { USER_BASE_TABLE_MODEL_FULL, USER_BASE_TABLE_MODEL_PLAIN } from './models/user-table-model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SearchableDisplay],
  template: `
    <h1>Searchable Table Demo</h1>
    <fieldset>
      <legend>Table Actions</legend>
      <button (click)="refreshData()">Refresh Data</button>
      <button (click)="addUser()">Generate Random User</button>
    </fieldset>
    <sd-searchable-display title="Users" [dataRows]="userData()" [tableModel]="userTableModel" [tableStyle]="userTableStyles"></sd-searchable-display>
    <h2>Another one</h2>
    <sd-searchable-display title="Users (Plain Model)" [dataRows]="simpleUserData()" [tableModel]="simpleTableModel" [tableStyle]="userTableStyles"></sd-searchable-display>
    <router-outlet />
  `,
  styles: ``,
})
export class App {
  protected readonly title = signal('Searchable Table');
  protected readonly usersService = inject(UserPlaceholderService);
  protected readonly baseTableModel = inject(USER_BASE_TABLE_MODEL_FULL);
  protected readonly simpleTableModel = inject(USER_BASE_TABLE_MODEL_PLAIN);
  protected readonly userTableStyles: TableStyleDefinition = {
    tableClasses: 'user-table',
    headerClasses: 'user-table-header',
    bodyClasses: 'user-table-body',
    footerClasses: 'user-table-footer',
    paginationClasses: {
      pageButtonClasses: 'user-table-page-button secondary',
      pageSizeDropdownClasses: 'user-table-page-size-dropdown',
      activePageButtonClasses: 'user-table-active-page primary',
      showPageSizeLabel: true,
    },
    actionCellClasses: (row: UserData, actionButton) => {
      let classes = '';
      if (actionButton.buttonText === 'View Details') {
        classes += 'view-details-button ';
      }
      if (actionButton.buttonText === 'Email') {
        classes += 'email-button ';
      }
      return classes;
    },
  };

  protected readonly refreshData = () => {
    this.usersService.refreshUsers();
  }

  protected readonly users = computed(() => {
    return [...this.usersService.users()];
  });

  protected readonly userData = linkedSignal(() => {
    return [...this.users()];
  });

  protected readonly simpleUserData = computed(() => {
    return [...this.users()];
  });

  addUser() {
    const users = this.userData();
    let randomNewUser: UserData = this.usersService.generateRandomUser();
    this.userData.set([...users, randomNewUser]);
  }

  removeUser(userId: number) {
    const users = this.userData();
    this.userData.set(users.filter(u => u.id !== userId));
  }

  protected readonly userTableModel: TableModel<UserData> = {
      ...this.baseTableModel,
      actionColumns: [
      {
        header: 'Actions',
        columnLocation: 'start',
        actionButtonDefinitions: [
          {
            buttonText: 'View Details',
            clickAction: (row: UserData) => {
              alert(`User details:\n${JSON.stringify(row, null, 2)}`);
              return signal(null);
            },
          },
          {
            buttonText: 'Email',
            clickAction: (row: UserData) => {
              alert(`Send an email to:\n${row.email}`);
              return signal(null);
            },
          },
        ],
      },
      {
        header: 'Delete',
        columnLocation: 'end',
        actionButtonDefinitions: [
          {
            buttonText: '🗑',
            clickAction: (row: UserData) => {
              if (confirm(`Are you sure you want to delete user "${row.name}"?`)) {
                this.removeUser(row.id);
              }
              return signal(null);
            },
          },
        ],
      },
    ],
  };
}
