import { Routes } from '@angular/router';

export const patientsRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./pages/patient-list/patient-list').then(m => m.PatientList),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/patient-register/patient-register').then(m => m.PatientRegister),
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./pages/patient-form/patient-form').then(m => m.PatientForm),
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./pages/patient-detail/patient-detail').then(m => m.PatientDetail),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
