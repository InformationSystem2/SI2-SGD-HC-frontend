import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";





export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const accessToken = auth.accessToken();
  const tenantSlug = localStorage.getItem('tenantSlug');

  let headers: { [name: string]: string } = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (tenantSlug) {
    headers['X-Tenant-ID'] = tenantSlug;
  }

  if (Object.keys(headers).length > 0) {
    const cloned = req.clone({ setHeaders: headers });
    return next(cloned);
  }

  return next(req);
}
