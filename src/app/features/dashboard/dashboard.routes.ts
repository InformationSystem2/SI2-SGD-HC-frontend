import { Routes } from "@angular/router";




export const dashboardRoutes: Routes = [

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
  },
  {
    path: 'documentos',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

];
