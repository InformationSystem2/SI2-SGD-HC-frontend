import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubscriptionStatusService } from '../../services/subscription-status.service';

export function subscriptionGuard(): CanActivateFn {
  return () => {
    const subStatus = inject(SubscriptionStatusService);
    const router = inject(Router);
    const currentUrl = router.url;

    const allowedPaths = [
      '/dashboard/tenant/subscription',
      '/dashboard/tenant/info',
      '/dashboard/tenant/appearance'
    ];

    if (allowedPaths.some(p => currentUrl.startsWith(p))) {
      return true;
    }

    const w = subStatus.warning();

    if (w?.severity === 'critical') {
      return router.createUrlTree(['/dashboard/tenant/subscription']);
    }

    return true;
  };
}
