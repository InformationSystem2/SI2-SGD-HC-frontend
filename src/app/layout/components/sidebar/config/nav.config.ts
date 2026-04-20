import type { NavItem } from '../models/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard/dashboard',
    icon: 'layout-dashboard',
  },
  {
    label: 'Documentos',
    path: '/dashboard/documentos',
    icon: 'file-text',
  },
  {
    label: 'Roles',
    path: '/roles/list',
    icon: 'shield',
  },
  // {
  //   label: 'Expedientes',
  //   path: '/dashboard/expedientes',
  //   icon: 'folder-open',
  //   subItems: [
  //     { label: 'Activos',    path: '/dashboard/expedientes/activos' },
  //     { label: 'Archivados', path: '/dashboard/expedientes/archivados' },
  //   ],
  // },
  {
    label: 'Usuarios',
    path: '/usuarios/list',
    icon: 'users',
    subItems: [
      { label: 'Lista',      path: '/usuarios/list' },
      { label: 'Registrar',  path: '/usuarios/register' },
    ],
  },
  {
    label: 'Configuración',
    path: '/dashboard/configuracion',
    icon: 'settings',
  },
];
