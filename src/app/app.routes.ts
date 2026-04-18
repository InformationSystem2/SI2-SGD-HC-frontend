import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./shared/auth/auth.routes').then( m => m.authRoutes),
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    // loadComponent: () => import('./shared/dashboard/...') cuando lo crees
    redirectTo: 'auth/login', // temporal
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

];
