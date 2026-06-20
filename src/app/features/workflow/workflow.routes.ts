import { Routes } from '@angular/router';

export const workflowRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/review-inbox/review-inbox').then(m => m.ReviewInbox),
  },
];
