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
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
