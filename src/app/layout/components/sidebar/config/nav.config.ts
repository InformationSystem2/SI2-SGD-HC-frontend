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
    path: '/dashboard/usuarios',
    icon: 'users',
  },
  {
    label: 'Configuración',
    path: '/dashboard/configuracion',
    icon: 'settings',
  },
];
