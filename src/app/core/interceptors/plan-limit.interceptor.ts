import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { catchError, throwError } from "rxjs";

function showPlanLimitToast(message: string, title: string): void {
  const existing = document.getElementById('plan-limit-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'plan-limit-toast';
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 99999;
    max-width: 420px; padding: 16px 20px;
    background: #1e293b; color: #f8fafc; border-left: 4px solid #f59e0b;
    border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    font-family: Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.5;
    animation: slideIn 0.3s ease-out;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-weight: 700; margin-bottom: 4px; color: #f59e0b;';
  titleEl.textContent = title;

  const msgEl = document.createElement('div');
  msgEl.style.cssText = 'color: #cbd5e1;';
  msgEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00D7';
  closeBtn.style.cssText = `
    position: absolute; top: 8px; right: 12px; background: none; border: none;
    color: #94a3b8; font-size: 18px; cursor: pointer; line-height: 1;
  `;
  closeBtn.onclick = () => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  };

  toast.appendChild(titleEl);
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.getElementById('plan-limit-toast')) {
      toast.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 8000);
}

export const planLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 403 && err.error?.error === "Plan Limit Exceeded") {
        const resourceType = err.error.resourceType || "";
        const currentCount = err.error.currentCount ?? 0;
        const maxLimit = err.error.maxLimit ?? 0;

        const resourceLabels: Record<string, string> = {
          "usuarios":           translate.instant("PLAN_LIMIT.USERS"),
          "pacientes":          translate.instant("PLAN_LIMIT.PATIENTS"),
          "documentos":         translate.instant("PLAN_LIMIT.DOCUMENTS"),
          "plantillas":         translate.instant("PLAN_LIMIT.TEMPLATES"),
          "estudios DICOM":     translate.instant("PLAN_LIMIT.DICOM"),
          "roles de staff":     translate.instant("PLAN_LIMIT.ROLES"),
          "almacenamiento":     translate.instant("PLAN_LIMIT.STORAGE"),
          "páginas OCR (este mes)": translate.instant("PLAN_LIMIT.OCR_PAGES"),
          "llamadas API (este mes)": translate.instant("PLAN_LIMIT.API_CALLS"),
        };

        const label = resourceLabels[resourceType] || resourceType;
        const message = translate.instant("PLAN_LIMIT.MESSAGE", {
          resource: label,
          current: currentCount,
          max: maxLimit,
        });

        showPlanLimitToast(message, translate.instant("PLAN_LIMIT.TITLE"));
      }

      return throwError(() => err);
    })
  );
};
