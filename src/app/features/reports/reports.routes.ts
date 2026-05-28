import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: 'designer',
    loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent),
  },
  {
    path: 'templates',
    loadComponent: () => import('./pages/templates-list/templates-list').then(m => m.ReportTemplatesList),
  },
  {
    path: '',
    redirectTo: 'designer',
    pathMatch: 'full',
  },
];
