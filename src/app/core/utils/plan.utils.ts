import { PlanDto } from '../../features/tenants/models/plan.model';

/** Sentinel value for "unlimited" used in plan_limits table (V15 SQL: -1) */
export const UNLIMITED = -1;

export interface PlanLimits {
  maxUsers: number;
  maxStorageMB: number;
  maxApiCallsPerMonth: number;
  maxPatients: number;
  maxDocuments: number;
  maxDocumentTemplates: number;
  maxReportTemplates: number;
  maxDicomStudies: number;
  maxOcrPagesPerMonth: number;
  maxBackupsPerYear: number;
  maxStaffRoles: number;
}

export interface PlanFeatureOption {
  key: string;
  params?: any;
}

export interface PlanOption {
  id: string;
  name: string;
  price: string;
  icon: string;
  popular: boolean;
  description: string;
  features: PlanFeatureOption[];
}

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: 'TENANTS.MONTHLY',
  YEARLY: 'TENANTS.YEARLY'
};

export function getBillingCycleLabel(cycle: string): string {
  return BILLING_CYCLE_LABELS[cycle] || cycle;
}

export function getYearlySavings(monthly: number, yearly: number): string {
  if (!monthly || !yearly || yearly >= monthly * 12) return '';
  const fullYear = monthly * 12;
  const savings = fullYear - yearly;
  return `$${savings.toFixed(0)}`;
}

export function getPlanIcon(planName: string): string {
  switch (planName.toUpperCase()) {
    case 'BASIC': return 'fa-seedling';
    case 'PRO': return 'fa-rocket';
    case 'ENTERPRISE': return 'fa-building';
    default: return 'fa-box';
  }
}

export function isUnlimited(value: number): boolean {
  return value === UNLIMITED || value < 0;
}

export function toPlanOption(plan: PlanDto): PlanOption {
  const features: PlanFeatureOption[] = [];
  const limits = plan.limits;

  if (limits['maxUsers'] !== undefined && limits['maxUsers'] !== 0) {
    features.push({
      key: isUnlimited(limits['maxUsers']) ? 'TENANTS.FEATURE_USERS_UNLIMITED' : 'TENANTS.FEATURE_USERS_N',
      params: { n: formatLimitValue(limits['maxUsers']) }
    });
  }
  if (limits['maxStorageMB'] !== undefined && limits['maxStorageMB'] !== 0) {
    features.push({
      key: isUnlimited(limits['maxStorageMB']) ? 'TENANTS.FEATURE_STORAGE_UNLIMITED' : 'TENANTS.FEATURE_STORAGE_N',
      params: { n: formatStorageMB(limits['maxStorageMB']) }
    });
  }
  if (limits['maxPatients'] !== undefined && limits['maxPatients'] !== 0) {
    features.push({
      key: isUnlimited(limits['maxPatients']) ? 'TENANTS.FEATURE_PATIENTS_UNLIMITED' : 'TENANTS.FEATURE_PATIENTS_N',
      params: { n: formatLimitValue(limits['maxPatients']) }
    });
  }
  if (plan.features['dicom_imaging']) {
    features.push({ key: 'TENANTS.FEATURE_DICOM' });
  }
  if (plan.features['ocr_scanning']) {
    features.push({ key: 'TENANTS.FEATURE_OCR' });
  }
  if (plan.features['custom_branding']) {
    features.push({ key: 'TENANTS.FEATURE_CUSTOM_BRANDING' });
  }
  if (plan.features['advanced_analytics']) {
    features.push({ key: 'TENANTS.FEATURE_ADVANCED_ANALYTICS' });
  }
  if (plan.features['two_factor_auth']) {
    features.push({ key: 'TENANTS.FEATURE_2FA' });
  }
  if (plan.features['api_access']) {
    features.push({ key: 'TENANTS.FEATURE_API' });
  }
  if (plan.features['support_24_7']) {
    features.push({ key: 'TENANTS.FEATURE_SUPPORT_24_7' });
  } else if (plan.features['priority_support']) {
    features.push({ key: 'TENANTS.FEATURE_SUPPORT_PRIORITY' });
  } else {
    features.push({ key: 'TENANTS.FEATURE_SUPPORT_EMAIL' });
  }

  return {
    id: plan.name,
    name: `TENANTS.PLAN_${plan.name}_NAME`,
    price: '0',
    icon: getPlanIcon(plan.name),
    popular: plan.name === 'PRO',
    description: `TENANTS.PLAN_${plan.name}_SHORT`,
    features
  };
}

export function isDowngrade(currentPlan: string, targetPlan: string): boolean {
  const weights: Record<string, number> = { BASIC: 1, PRO: 2, ENTERPRISE: 3 };
  return (weights[targetPlan] || 0) < (weights[currentPlan] || 0);
}

export function formatLimitValue(value: number): string {
  if (isUnlimited(value)) return '∞';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
}

export function formatStorageMB(mb: number): string {
  if (isUnlimited(mb)) return '∞';
  if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB';
  return mb + ' MB';
}
