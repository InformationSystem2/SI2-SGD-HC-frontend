import { Routes } from "@angular/router";
import { superuserGuard } from '../../core/auth/guards/role.guard';
import { subscriptionGuard } from '../../core/auth/guards/subscription.guard';

export const dashboardRoutes: Routes = [

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
    canActivate: [subscriptionGuard()],    
  },
  {
    path: 'documentos',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
    canActivate: [subscriptionGuard()],    
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
    canActivate: [subscriptionGuard()],    
  },
    {
    path: 'tenant/info',
    loadComponent: () => import('../tenants/pages/settings/info/info').then(m => m.Info),
  },
  {
    path: 'tenant/appearance',
    loadComponent: () => import('../tenants/pages/settings/appearance/appearance').then(m => m.Appearance),
  },
  {
    path: 'tenant/subscription',
    loadComponent: () => import('../tenants/pages/settings/subscription/subscription').then(m => m.Subscription),
  },
  {
    path: 'tenant/preferences',
    loadComponent: () => import('../tenants/pages/settings/preferences/preferences').then(m => m.Preferences),
    canActivate: [subscriptionGuard()],
  },
  {
    path: 'admin/tenants',
    loadComponent: () => import('../tenants/pages/admin/tenant-list/tenant-list').then(m => m.TenantList),
    canActivate: [superuserGuard()],
  },
  {
    path: 'admin/tenants/:id',
    loadComponent: () => import('../tenants/pages/admin/tenant-detail/tenant-detail').then(m => m.TenantDetail),
    canActivate: [superuserGuard()],
  },
  {
    path: 'admin/backups',
    loadComponent: () => import('../backups/pages/backup-management/backup-management').then(m => m.BackupManagement),
    canActivate: [superuserGuard()],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

];
