import type { NavItem } from '../models/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'NAV.DASHBOARD',
    path: '/dashboard/dashboard',
    icon: 'layout-dashboard',
  },
  {
    label: 'NAV.DOCUMENTS',
    path: '/dashboard/documentos',
    icon: 'file-text',
  },
  {
    label: 'NAV.ROLES',
    path: '/roles/list',
    icon: 'shield',
  },
  {
    label: 'NAV.USERS',
    path: '/usuarios/list',
    icon: 'users',
    subItems: [
      { label: 'NAV.USER_LIST',     path: '/usuarios/list' },
      { label: 'NAV.USER_REGISTER', path: '/usuarios/register' },
    ],
  },
  {
    label: 'NAV.SETTINGS',
    path: '/dashboard/configuracion',
    icon: 'settings',
  },
];
