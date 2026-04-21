import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'dashboard',
    component: MainLayout,
    // canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },
  {
    path: 'roles',
    component: MainLayout,
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./features/roles/roles.routes').then(m => m.rolesRoutes),
  },
  {
    path: 'usuarios',
    component: MainLayout,
    loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

];
