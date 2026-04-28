import { signal } from '@angular/core';
import { UserData } from './user';
import { ColumnDefinition } from 'ngx-searchable-table';

export const USER_COLUMN_DEFS_BASE: ColumnDefinition<UserData>[] = [
  {
    header: 'ID',
    searchable: false,
    sortable: true,
    valueDisplayMapper: (row: UserData) => (row?.id).toString(),
  },
  {
    header: 'Name',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.name ?? '',
    cellActionButtons: [
      {
        buttonText: '📋 Copy',
        clickAction: (row: UserData) => {
          navigator.clipboard.writeText(row?.name ?? '');
          return signal(null);
        },
      },
    ],
  },
];

export const USER_COLUMN_DEFS_DETAILS_MINIMAL: ColumnDefinition<UserData>[] = [
  {
    header: 'Username',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.username ?? '',
  },
  {
    header: 'Email',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.email ?? '',
  },
  {
    header: 'Phone',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.phone ?? '',
    cellActionButtons: [
      {
        buttonText: '📞 Call',
        clickAction: (row: UserData) => {
          alert(`Ring Ring 📞\nCalling ${row?.phone ?? 'unknown number'}...`);
          return signal(null);
        },
      },
      {
        buttonText: '📱 Text',
        clickAction: (row: UserData) => {
          alert(`SMS to ${row?.phone ?? 'unknown number'}...`);
          return signal(null);
        },
      },
    ],
  },
  {
    header: 'Website',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.website ?? '',
  },
];

export const USER_COLUMN_DEFS_CONTACT: ColumnDefinition<UserData>[] = [
  {
    header: 'Email',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.email ?? '',
  },
  {
    header: 'Phone',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.phone ?? '',
  },
  {
    header: 'Website',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.website ?? '',
  },
  {
    header: 'Full Address',
    searchable: true,
    sortable: false,
    valueDisplayMapper: (row: UserData) => row?.formattedAddress,
  },
  {
    header: 'Company Name',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.company?.name ?? '',
  },
];

export const USER_COLUMN_DEFS_COMPANY: ColumnDefinition<UserData>[] = [
  {
    header: 'Company Name',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.company?.name ?? '',
  },
  {
    header: 'Company Catch Phrase',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.company?.catchPhrase ?? '',
  },
  {
    header: 'Company Baloney',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.company?.bs ?? '',
  },
  {
    header: 'Company Display',
    searchable: true,
    sortable: false,
    valueDisplayMapper: (row: UserData) => row?.formattedCompany,
  },
];

export const USER_COLUMN_DEFS_ADDRESS: ColumnDefinition<UserData>[] = [
  {
    header: 'Street',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.street ?? '',
  },
  {
    header: 'Suite',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.suite ?? '',
  },
  {
    header: 'City',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.city ?? '',
  },
  {
    header: 'Zipcode',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.zipcode ?? '',
  },
];

export const USER_COLUMN_DEFS_LOCATION: ColumnDefinition<UserData>[] = [
  {
    header: 'Full Address',
    searchable: true,
    sortable: false,
    valueDisplayMapper: (row: UserData) => row?.formattedAddress,
  },
  {
    header: 'Geo Location',
    searchable: true,
    sortable: false,
    valueDisplayMapper: (row: UserData) => row?.formattedGeo,
  },
];

export const USER_COLUMN_DEFS_GEO: ColumnDefinition<UserData>[] = [
  {
    header: 'Latitude',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.geo?.lat ?? '',
  },
  {
    header: 'Longitude',
    searchable: true,
    sortable: true,
    valueDisplayMapper: (row: UserData) => row?.address?.geo?.lng ?? '',
  },
];

export const USER_COLUMN_DEFS_FULL: ColumnDefinition<UserData>[] = [
  ...USER_COLUMN_DEFS_BASE,
  ...USER_COLUMN_DEFS_DETAILS_MINIMAL,
  ...USER_COLUMN_DEFS_ADDRESS,
  ...USER_COLUMN_DEFS_COMPANY,
  ...USER_COLUMN_DEFS_GEO,
];

export const USER_COLUMN_DEFINITIONS_OPTIONS: Record<string, ColumnDefinition<UserData>[]> = {
  'Basic Details': USER_COLUMN_DEFS_DETAILS_MINIMAL,
  'Contact Info': USER_COLUMN_DEFS_CONTACT,
  'Company Info': USER_COLUMN_DEFS_COMPANY,
  'Location Details': USER_COLUMN_DEFS_LOCATION,
  'Address Details': USER_COLUMN_DEFS_ADDRESS,
};
