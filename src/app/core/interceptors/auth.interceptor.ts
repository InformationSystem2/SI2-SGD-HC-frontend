import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";





export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const accessToken = auth.accessToken();

  if (accessToken) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}`},
    });
    return next(cloned);
  }
  return next(req);
}
