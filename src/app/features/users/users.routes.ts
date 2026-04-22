import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/user-list/user-list').then(m => m.UserList),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/user-register/user-register').then(m => m.UserRegister),
  },
  {
    path: 'form/:id',
    loadComponent: () =>
      import('./pages/user-form/user-form').then(m => m.UserForm),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./pages/user-detail/user-detail').then(m => m.UserDetail),
  },
  {
    path: 'password/:id',
    loadComponent: () =>
      import('./pages/user-password/user-password').then(m => m.UserPassword),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
