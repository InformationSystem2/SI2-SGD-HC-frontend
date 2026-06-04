//src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { permissionGuard } from './core/auth/guards/role.guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'tenants',
    loadChildren: () => import('./features/tenants/tenants.routes').then(m => m.tenantsRoutes),
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
    canActivate: [permissionGuard('role:read')],
    loadChildren: () =>
      import('./features/roles/roles.routes').then(m => m.rolesRoutes),
  },
  {
    path: 'usuarios',
    component: MainLayout,
    canActivate: [permissionGuard('user:read')],
    loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes),
  },
  {
    path: 'pacientes',
    component: MainLayout,
    canActivate: [permissionGuard('patient:read')],
    loadChildren: () => import('./features/patients/patients.routes').then(m => m.patientsRoutes),
  },
  {
    path: 'documentos',
    component: MainLayout,
    canActivate: [permissionGuard('document:read')],
    loadChildren: () => import('./features/documents/documents.routes').then(m => m.documentsRoutes),
  },
  {
    // El visor DICOM ocupa toda la pantalla (sin MainLayout)
    path: 'dicom',
    canActivate: [permissionGuard('dicom:read')],
    loadChildren: () => import('./features/dicom/dicom.routes').then(m => m.dicomRoutes),
  },
  {
    path: 'reportes',
    component: MainLayout,
    canActivate: [permissionGuard('report:read')],
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportsRoutes),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  // Dentro del array routes, agrega:
  {
    path: 'historiales',
    component: MainLayout,
    canActivate: [permissionGuard('document:read')],
    loadChildren: () => import('./features/historial/historial.routes').then(m => m.historialRoutes),
  }
];
