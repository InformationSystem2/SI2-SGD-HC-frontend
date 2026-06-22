import { Routes } from '@angular/router';

export const workflowRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/review-inbox/review-inbox').then(m => m.ReviewInbox),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/workflow-create/workflow-create').then(m => m.WorkflowCreatePage),
  },
  {
    path: 'workflow/:id',
    loadComponent: () =>
      import('./pages/workflow-detail/workflow-detail').then(m => m.WorkflowDetailPage),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/workflow-stats/workflow-stats').then(m => m.WorkflowStatsPage),
  },
];
