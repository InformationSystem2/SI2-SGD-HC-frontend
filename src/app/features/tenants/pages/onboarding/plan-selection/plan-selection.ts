import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { PlanService } from '../../../../../core/services/plan.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSeedling, faRocket, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { PlanDto } from '../../../models/plan.model';
import { toPlanOption, getYearlySavings } from '../../../../../core/utils/plan.utils';

@Component({
  selector: 'app-plan-selection',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ProgressStepperComponent, FontAwesomeModule],
  templateUrl: './plan-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSelection implements OnInit {
  private router = inject(Router);
  protected tenantService = inject(TenantService);
  protected planService = inject(PlanService);

  readonly selectedPlan = signal<string>('BASIC');
  readonly billingCycle = signal<'MONTHLY' | 'YEARLY'>('MONTHLY');
  readonly loading = signal(false);
  readonly hasExistingSession = signal(false);
  readonly plans = signal<PlanDto[]>([]);
  readonly loadingPlans = signal(true);

  readonly faSeedling = faSeedling;
  readonly faRocket = faRocket;
  readonly faBuilding = faBuilding;

  readonly displayPrice = computed(() => {
    const plan = this.plans().find(p => p.name === this.selectedPlan());
    if (!plan) return '0';
    return this.billingCycle() === 'YEARLY' ? plan.priceYearly.toString() : plan.priceMonthly.toString();
  });

  readonly yearlySavings = computed(() => {
    const plan = this.plans().find(p => p.name === this.selectedPlan());
    if (!plan || plan.priceYearly <= 0 || plan.priceMonthly <= 0) return '';
    return getYearlySavings(plan.priceMonthly, plan.priceYearly);
  });

  getIcon(planId: string) {
    switch (planId) {
      case 'BASIC': return faSeedling;
      case 'PRO': return faRocket;
      case 'ENTERPRISE': return faBuilding;
      default: return faSeedling;
    }
  }

  getPlanOption(plan: PlanDto) {
    return toPlanOption(plan);
  }

  ngOnInit(): void {
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadingPlans.set(false);
      },
      error: () => this.loadingPlans.set(false)
    });

    const flowData = this.tenantService.getFlowData();
    if (flowData) {
      if (flowData.selectedPlan) {
        this.selectedPlan.set(flowData.selectedPlan);
      }
      if (flowData.billingCycle) {
        this.billingCycle.set(flowData.billingCycle as 'MONTHLY' | 'YEARLY');
      }
      if (flowData.registrationData?.tenantName) {
        this.hasExistingSession.set(true);
      }
    }
  }

  selectPlan(planId: string): void {
    this.selectedPlan.set(planId);
    const flowData = this.tenantService.getFlowData();
    if (flowData) {
      this.tenantService.updatePlanInFlow(planId);
    }
  }

  toggleBillingCycle(cycle: 'MONTHLY' | 'YEARLY'): void {
    this.billingCycle.set(cycle);
  }

  continue(): void {
    const existingFlow = this.tenantService.getFlowData();
    const selectedPlan = this.selectedPlan();
    const cycle = this.billingCycle();

    const needsNewSession = !existingFlow
        || existingFlow.selectedPlan !== selectedPlan
        || existingFlow.billingCycle !== cycle;

    if (needsNewSession) {
      this.loading.set(true);
      this.tenantService.initSession(selectedPlan, cycle).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/tenants/register']);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.router.navigate(['/tenants/register']);
    }
  }
}
