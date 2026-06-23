import { HttpInterceptorFn } from "@angular/common/http";

const sessionId = crypto.randomUUID();

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // No agregar headers en endpoints de login o refresh
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  let headers: { [name: string]: string } = {
    'X-Session-ID': sessionId,
    'X-Client-Time': (() => {
      const now = new Date();
      const tzOffsetMs = now.getTimezoneOffset() * -60000;
      const local = new Date(now.getTime() + tzOffsetMs);
      const sign = tzOffsetMs >= 0 ? '+' : '-';
      const absOffset = Math.abs(now.getTimezoneOffset());
      const hh = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const mm = String(absOffset % 60).padStart(2, '0');
      return local.toISOString().slice(0, -1) + `${sign}${hh}:${mm}`;
    })()
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    const payload = decodeJwt(accessToken);
    const impersonatedTenant = typeof localStorage !== 'undefined' ? localStorage.getItem('impersonatedTenantSlug') : null;
    const isSuperuser = payload?.roles?.includes('ROLE_SUPERUSER');

    if (impersonatedTenant) {
      headers['X-Tenant-ID'] = impersonatedTenant;
    } else if (payload?.tenantSlug && !isSuperuser) {
      headers['X-Tenant-ID'] = payload.tenantSlug;
    }
  }

  if (Object.keys(headers).length > 0) {
    const cloned = req.clone({ setHeaders: headers });
    return next(cloned);
  }

  return next(req);
}