import { Routes } from "@angular/router";

export const tenantsRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment/payment').then(m => m.Payment),
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
