import { Routes } from '@angular/router';

export const rolesRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/role-list/role-list').then(m => m.RoleList),
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./pages/role-form/role-form').then(m => m.RoleForm),
  },
  {
    path: 'form/:id',
    loadComponent: () =>
      import('./pages/role-form/role-form').then(m => m.RoleForm),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
