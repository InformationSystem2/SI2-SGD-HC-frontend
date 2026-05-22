import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSeedling, faRocket, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { PLANS } from '../../../../../core/utils/plan.utils';

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

  readonly selectedPlan = signal<string>('BASIC');
  readonly loading = signal(false);
  readonly hasExistingSession = signal(false);

  readonly plans = PLANS;
  readonly faSeedling = faSeedling;
  readonly faRocket = faRocket;
  readonly faBuilding = faBuilding;

  getIcon(planId: string) {
    switch (planId) {
      case 'BASIC': return faSeedling;
      case 'PRO': return faRocket;
      case 'ENTERPRISE': return faBuilding;
      default: return faSeedling;
    }
  }

  ngOnInit(): void {
    const flowData = this.tenantService.getFlowData();
    if (flowData) {
      if (flowData.selectedPlan) {
        this.selectedPlan.set(flowData.selectedPlan);
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

  continue(): void {
    const existingFlow = this.tenantService.getFlowData();
    const selectedPlan = this.selectedPlan();

    if (existingFlow) {
      const needsPlanUpdate = selectedPlan !== existingFlow.selectedPlan;

      if (needsPlanUpdate) {
        this.loading.set(true);
        this.tenantService.updatePlanInFlow(selectedPlan).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/tenants/register']);
          },
          error: () => this.loading.set(false)
        });
      } else {
        this.router.navigate(['/tenants/register']);
      }
    } else {
      this.loading.set(true);
      this.tenantService.initSession(selectedPlan).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/tenants/register']);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }
}