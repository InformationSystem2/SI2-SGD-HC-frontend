import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const accessToken = auth.accessToken();

  // No agregar headers en endpoints de login o refresh
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  let headers: { [name: string]: string } = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    const payload = decodeJwt(accessToken);
    if (payload?.tenantSlug) {
      headers['X-Tenant-ID'] = payload.tenantSlug;
    }
  }

  if (Object.keys(headers).length > 0) {
    const cloned = req.clone({ setHeaders: headers });
    return next(cloned);
  }

  return next(req);
}