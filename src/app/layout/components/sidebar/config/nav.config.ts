import type { NavItem } from '../models/nav-item.model';

const ADMIN_ROLES = ['ROLE_SUPERUSER', 'ROLE_ADMIN'];

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
    roles: ADMIN_ROLES,
  },
  {
    label: 'NAV.USERS',
    path: '/usuarios/list',
    icon: 'users',
    roles: ADMIN_ROLES,
    subItems: [
      { label: 'NAV.USER_LIST',     path: '/usuarios/list' },
      { label: 'NAV.USER_REGISTER', path: '/usuarios/register' },
    ],
  },
  {
    label: 'NAV.PATIENTS',
    path: '/pacientes/list',
    icon: 'heart-pulse',
    roles: ADMIN_ROLES,
    subItems: [
      { label: 'NAV.PATIENT_LIST',     path: '/pacientes/list' },
      { label: 'NAV.PATIENT_REGISTER', path: '/pacientes/register' },
    ],
  },
  {
    label: 'NAV.SETTINGS',
    path: '/dashboard/configuracion',
    icon: 'settings',
  },
];
