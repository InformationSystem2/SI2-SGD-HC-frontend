import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PlanService, PlanUpdateDto } from '../../../../../core/services/plan.service';
import { PlanDto } from '../../../models/plan.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  faCrown, faSave, faSpinner, faTimes, faChevronDown, faChevronUp,
  faToggleOn, faToggleOff, faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { formatStorageMB, formatLimitValue } from '../../../../../core/utils/plan.utils';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, FontAwesomeModule],
  templateUrl: './plan-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanManagement implements OnInit {
  private planService = inject(PlanService);
  private translate = inject(TranslateService);

  readonly plans = signal<PlanDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal<Record<string, boolean>>({});
  readonly expandedPlan = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly messageType = signal<'success' | 'error'>('success');

  readonly edits = signal<Record<string, PlanUpdateDto>>({});

  readonly faCrown = faCrown;
  readonly faSave = faSave;
  readonly faSpinner = faSpinner;
  readonly faTimes = faTimes;
  readonly faChevronDown = faChevronDown;
  readonly faChevronUp = faChevronUp;
  readonly faToggleOn = faToggleOn;
  readonly faToggleOff = faToggleOff;
  readonly faExclamationCircle = faExclamationCircle;

  readonly limitLabels: Record<string, string> = {
    maxUsers: 'PLANS.LIMIT_USERS',
    maxStorageMB: 'PLANS.LIMIT_STORAGE',
    maxApiCallsPerMonth: 'PLANS.LIMIT_API_CALLS',
    maxPatients: 'PLANS.LIMIT_PATIENTS',
    maxDocuments: 'PLANS.LIMIT_DOCUMENTS',
    maxDocumentTemplates: 'PLANS.LIMIT_DOC_TEMPLATES',
    maxReportTemplates: 'PLANS.LIMIT_REPORT_TEMPLATES',
    maxDicomStudies: 'PLANS.LIMIT_DICOM',
    maxOcrPagesPerMonth: 'PLANS.LIMIT_OCR',
    maxBackupsPerYear: 'PLANS.LIMIT_BACKUPS',
    maxStaffRoles: 'PLANS.LIMIT_ROLES',
    maxActiveReviewTasks: 'PLANS.LIMIT_ACTIVE_REVIEW_TASKS',
    maxReviewTasksPerMonth: 'PLANS.LIMIT_REVIEW_TASKS_MONTHLY',
    maxVersionsPerDocument: 'PLANS.LIMIT_VERSIONS_PER_DOC',
    maxVersionsPerMonth: 'PLANS.LIMIT_VERSIONS_MONTHLY',
  };

  readonly featureLabels: Record<string, string> = {
    dicom_imaging: 'PLANS.FEATURE_DICOM',
    ocr_scanning: 'PLANS.FEATURE_OCR',
    online_editing: 'PLANS.FEATURE_EDITING',
    custom_branding: 'PLANS.FEATURE_BRANDING',
    advanced_analytics: 'PLANS.FEATURE_ANALYTICS',
    report_builder: 'PLANS.FEATURE_REPORTS',
    api_access: 'PLANS.FEATURE_API',
    email_notifications: 'PLANS.FEATURE_EMAIL',
    push_notifications: 'PLANS.FEATURE_PUSH',
    custom_roles: 'PLANS.FEATURE_ROLES',
  };

  ngOnInit(): void {
    this.planService.clearCache();
    this.planService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getPlanIcon(planName: string): string {
    switch (planName) {
      case 'BASIC': return 'fa-seedling';
      case 'PRO': return 'fa-rocket';
      case 'ENTERPRISE': return 'fa-building';
      default: return 'fa-box';
    }
  }

  getPlanColor(planName: string): string {
    switch (planName) {
      case 'BASIC': return 'from-emerald-500 to-teal-600';
      case 'PRO': return 'from-hc-primary to-hc-primary-dark';
      case 'ENTERPRISE': return 'from-indigo-500 to-purple-600';
      default: return 'from-hc-primary to-hc-primary-dark';
    }
  }

  initEdit(plan: PlanDto): void {
    const key = plan.name;
    if (this.edits()[key]) return;
    this.edits.update(e => ({
      ...e,
      [key]: {
        displayName: plan.displayName,
        description: plan.description || '',
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        cycleDays: plan.cycleDays,
        gracePeriodDays: plan.gracePeriodDays,
        limits: { ...plan.limits },
        features: { ...plan.features },
      }
    }));
  }

  cancelEdit(planName: string): void {
    this.edits.update(e => {
      const copy = { ...e };
      delete copy[planName];
      return copy;
    });
  }

  updateField(planName: string, field: keyof PlanUpdateDto, value: any): void {
    this.edits.update(e => {
      const plan = e[planName];
      if (!plan) return e;
      return { ...e, [planName]: { ...plan, [field]: value } };
    });
  }

  updateLimit(planName: string, limitKey: string, value: number): void {
    this.edits.update(e => {
      const plan = e[planName];
      if (!plan) return e;
      return {
        ...e,
        [planName]: {
          ...plan,
          limits: { ...plan.limits, [limitKey]: value }
        }
      };
    });
  }

  toggleFeature(planName: string, featureKey: string): void {
    this.edits.update(e => {
      const plan = e[planName];
      if (!plan) return e;
      return {
        ...e,
        [planName]: {
          ...plan,
          features: { ...plan.features, [featureKey]: !plan.features?.[featureKey] }
        }
      };
    });
  }

  savePlan(planId: string, planName: string): void {
    const edit = this.edits()[planName];
    if (!edit) return;

    this.saving.update(s => ({ ...s, [planName]: true }));
    const dto: PlanUpdateDto = { ...edit };
    if (dto.priceMonthly !== undefined) dto.priceMonthly = Number(dto.priceMonthly);
    if (dto.priceYearly !== undefined) dto.priceYearly = Number(dto.priceYearly);

    this.planService.updatePlan(planId, dto).subscribe({
      next: (updated) => {
        this.saving.update(s => ({ ...s, [planName]: false }));
        this.plans.update(ps => ps.map(p => p.id === planId ? updated : p));
        this.cancelEdit(planName);
        this.showMessage(this.translate.instant('PLANS.SAVE_SUCCESS'), 'success');
      },
      error: () => {
        this.saving.update(s => ({ ...s, [planName]: false }));
        this.showMessage(this.translate.instant('PLANS.SAVE_ERROR'), 'error');
      }
    });
  }

  toggleExpand(planName: string): void {
    this.expandedPlan.update(e => e === planName ? null : planName);
    const plan = this.plans().find(p => p.name === planName);
    if (plan) this.initEdit(plan);
  }

  isEditing(planName: string): boolean {
    return !!this.edits()[planName];
  }

  isSaving(planName: string): boolean {
    return this.saving()[planName] || false;
  }

  isExpanded(planName: string): boolean {
    return this.expandedPlan() === planName;
  }

  formatLimitValue(value: number): string {
    return value <= 0 ? '∞' : formatLimitValue(value);
  }

  formatStorageMB(value: number): string {
    return value <= 0 ? '∞' : formatStorageMB(value);
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}
