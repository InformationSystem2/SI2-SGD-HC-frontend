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

export function roleGuard(role: string): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || auth.isTokenExpired())
      return router.createUrlTree(['/auth/login']);

    return auth.hasPermission(role)
      ? true
      : router.createUrlTree(['/dashboard/dashboard']);
  };
}

export function superuserGuard(): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || auth.isTokenExpired())
      return router.createUrlTree(['/auth/login']);

    return auth.roles().includes('ROLE_SUPERUSER')
      ? true
      : router.createUrlTree(['/dashboard/dashboard']);
  };
}

export function moduleRoleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || auth.isTokenExpired())
      return router.createUrlTree(['/auth/login']);

    const userRoles = auth.roles();
    return allowedRoles.some(r => userRoles.includes(r))
      ? true
      : router.createUrlTree(['/dashboard/dashboard']);
  };
}