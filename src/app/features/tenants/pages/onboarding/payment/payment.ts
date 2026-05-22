import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { PLAN_NAMES, PLAN_PRICES } from '../../../../../core/utils/plan.utils';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ProgressStepperComponent],
  templateUrl: './payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment implements OnInit {
  private router = inject(Router);
  protected tenantService = inject(TenantService);
  protected translate = inject(TranslateService);

  readonly processing = signal(false);

  selectedPlan = signal<string>('BASIC');
  planPrice = signal<string>('0');

  readonly PLAN_NAMES = PLAN_NAMES;

  ngOnInit(): void {
    const data = this.tenantService.getFlowData();
    if (!data) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    this.selectedPlan.set(data.selectedPlan);
    this.planPrice.set(PLAN_PRICES[data.selectedPlan as keyof typeof PLAN_PRICES] || '0');
  }

  confirmPayment(): void {
    this.processing.set(true);
    setTimeout(() => {
      this.tenantService.processPayment().subscribe({
        next: () => {
          this.processing.set(false);
          this.router.navigate(['/tenants/success']);
        },
        error: () => {
          this.processing.set(false);
          this.tenantService.error.set(this.translate.instant('ERRORS.PAYMENT_FAILED'));
        }
      });
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/tenants/register']);
  }
}