import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../features/tenants/services/tenant.service';
import { TenantInfo } from '../../features/tenants/models/tenant.model';

export interface SubscriptionWarning {
  type: 'EXPIRING' | 'GRACE' | 'EXPIRED';
  message: string;
  severity: 'warning' | 'critical';
}

@Injectable({ providedIn: 'root' })
export class SubscriptionStatusService {
  private tenantService = inject(TenantService);
  private translate = inject(TranslateService);

  readonly warning = signal<SubscriptionWarning | null>(null);
  readonly status = signal<string>('ACTIVE');
  readonly daysUntilExpiration = signal(999);
  readonly daysSinceExpiration = signal(0);

  checkStatus(): void {
    this.tenantService.getTenantInfo().subscribe({
      next: (info: TenantInfo) => {
        if (!info.subscriptionEndDate) return;

        const endDate = new Date(info.subscriptionEndDate + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        this.status.set(info.subscriptionStatus);
        this.daysUntilExpiration.set(days);

        if (days <= 0) {
          const absDays = Math.abs(days);
          this.daysSinceExpiration.set(absDays);
          if (absDays > 3) {
            this.warning.set({
              type: 'EXPIRED',
              message: this.translate.instant('SUBSCRIPTION.WARNING_EXPIRED'),
              severity: 'critical'
            });
          } else {
            this.warning.set({
              type: 'GRACE',
              message: this.translate.instant('SUBSCRIPTION.WARNING_GRACE', { days: absDays }),
              severity: 'warning'
            });
          }
        } else if (days <= 7) {
          this.warning.set({
            type: 'EXPIRING',
            message: this.translate.instant('SUBSCRIPTION.WARNING_EXPIRING', { days }),
            severity: 'warning'
          });
        }
      }
    });
  }
}
