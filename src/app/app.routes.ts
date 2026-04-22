import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { adminGuard } from './core/auth/guards/role.guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'dashboard',
    component: MainLayout,
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
  },
  {
    path: 'roles',
    component: MainLayout,
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/roles/roles.routes').then(m => m.rolesRoutes),
  },
  {
    path: 'usuarios',
    component: MainLayout,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes),
  },
  {
    path: 'pacientes',
    component: MainLayout,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/patients/patients.routes').then(m => m.patientsRoutes),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

];
