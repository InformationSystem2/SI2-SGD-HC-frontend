import { Routes } from "@angular/router";

export const tenantsRoutes: Routes = [
  {
    path: 'select-plan',
    loadComponent: () => import('./pages/onboarding/plan-selection/plan-selection').then(m => m.PlanSelection),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/onboarding/register/register').then(m => m.Register),
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/onboarding/payment/payment').then(m => m.Payment),
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/onboarding/success/success').then(m => m.Success),
  },
  {
    path: '',
    redirectTo: 'select-plan',
    pathMatch: 'full',
  },
  {
    path: 'admin/tenants',
    loadComponent: () => import('./pages/admin/tenant-list/tenant-list').then(m => m.TenantList),
  },
  {
    path: 'admin/tenants/:id',
    loadComponent: () => import('./pages/admin/tenant-detail/tenant-detail').then(m => m.TenantDetail),
  },
];