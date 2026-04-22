import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ADMIN_ROLES = ['ROLE_SUPERUSER', 'ROLE_ADMIN'];

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated() || auth.isTokenExpired())
    return router.createUrlTree(['/auth/login']);

  const hasRole = auth.roles().some(r => ADMIN_ROLES.includes(r));
  if (hasRole) return true;

  return router.createUrlTree(['/dashboard/dashboard']);
};
