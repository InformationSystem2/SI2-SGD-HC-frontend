import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function permissionGuard(permission: string): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || auth.isTokenExpired())
      return router.createUrlTree(['/auth/login']);

    return auth.hasPermission(permission)
      ? true
      : router.createUrlTree(['/dashboard/dashboard']);
  };
}
