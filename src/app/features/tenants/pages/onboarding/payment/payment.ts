import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { PlanService } from '../../../../../core/services/plan.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { getBillingCycleLabel } from '../../../../../core/utils/plan.utils';

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
  protected planService = inject(PlanService);
  protected translate = inject(TranslateService);

  readonly processing = signal(false);

  selectedPlan = signal<string>('BASIC');
  planPrice = signal<string>('0');
  billingCycle = signal<string>('MONTHLY');
  billingCycleLabel = signal<string>('');
  planDisplayName = signal<string>('');

  ngOnInit(): void {
    const data = this.tenantService.getFlowData();
    if (!data) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    this.selectedPlan.set(data.selectedPlan);
    this.billingCycle.set(data.billingCycle || 'MONTHLY');
    this.billingCycleLabel.set(getBillingCycleLabel(data.billingCycle || 'MONTHLY'));

    this.planService.getPlan(data.selectedPlan).subscribe(plan => {
      const price = data.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
      this.planPrice.set(price.toString());
      this.planDisplayName.set(plan.displayName);
    });
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
