import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/role.guard';

export const usersRoutes: Routes = [
  {
    path: 'list',
    canActivate: [permissionGuard('user:read')],
    loadComponent: () =>
      import('./pages/user-list/user-list').then(m => m.UserList),
  },
  {
    path: 'register',
    canActivate: [permissionGuard('user:create')],
    loadComponent: () =>
      import('./pages/user-register/user-register').then(m => m.UserRegister),
  },
  {
    path: 'form/:id',
    canActivate: [permissionGuard('user:update')],
    loadComponent: () =>
      import('./pages/user-form/user-form').then(m => m.UserForm),
  },
  {
    path: 'detail/:id',
    canActivate: [permissionGuard('user:read')],
    loadComponent: () =>
      import('./pages/user-detail/user-detail').then(m => m.UserDetail),
  },
  {
    path: 'password/:id',
    canActivate: [permissionGuard('user:update')],
    loadComponent: () =>
      import('./pages/user-password/user-password').then(m => m.UserPassword),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
