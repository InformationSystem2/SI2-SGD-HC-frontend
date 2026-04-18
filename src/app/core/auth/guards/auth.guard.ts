import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";




export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isValid = auth.isAuthenticated() && !auth.isTokenExpired();

  if (isValid) return true;

  return router.createUrlTree(['/auth/login']);
}
