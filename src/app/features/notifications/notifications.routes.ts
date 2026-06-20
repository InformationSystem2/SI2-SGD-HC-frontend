import { Routes } from '@angular/router';

export const notificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/notification-list/notification-list').then(m => m.NotificationList),
  },
];
