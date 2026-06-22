import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/role.guard';

export const rolesRoutes: Routes = [
  {
    path: 'list',
    canActivate: [permissionGuard('role:read')],
    loadComponent: () =>
      import('./pages/role-list/role-list').then(m => m.RoleList),
  },
  {
    path: 'form',
    canActivate: [permissionGuard('role:create')],
    loadComponent: () =>
      import('./pages/role-form/role-form').then(m => m.RoleForm),
  },
  {
    path: 'form/:id',
    canActivate: [permissionGuard('role:update')],
    loadComponent: () =>
      import('./pages/role-form/role-form').then(m => m.RoleForm),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
