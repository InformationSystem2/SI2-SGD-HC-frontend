export interface PlanOption {
  id: string;
  name: string;
  price: string;
  icon: string;
  popular: boolean;
  description: string;
  features: string[];
}

export interface PlanLimits {
  maxUsers: number;
  maxStorageMB: number;
  maxApiCallsPerMonth: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  BASIC: { maxUsers: 10, maxStorageMB: 1000, maxApiCallsPerMonth: 1000 },
  PRO: { maxUsers: 50, maxStorageMB: 10000, maxApiCallsPerMonth: 10000 },
  ENTERPRISE: { maxUsers: 999999, maxStorageMB: 999999999, maxApiCallsPerMonth: 999999999 }
};

export const PLAN_ORDER = ['BASIC', 'PRO', 'ENTERPRISE'] as const;

export const PLAN_WEIGHTS: Record<string, number> = {
  BASIC: 1,
  PRO: 2,
  ENTERPRISE: 3
};

export function getPlanWeight(planId: string): number {
  return PLAN_WEIGHTS[planId] ?? 0;
}

export function isDowngrade(currentPlan: string, targetPlan: string): boolean {
  return getPlanWeight(targetPlan) < getPlanWeight(currentPlan);
}

export const PLAN_NAMES: Record<string, string> = {
  BASIC: 'TENANTS.PLAN_BASIC_NAME',
  PRO: 'TENANTS.PLAN_PRO_NAME',
  ENTERPRISE: 'TENANTS.PLAN_ENTERPRISE_NAME'
};

export const PLAN_PRICES: Record<string, string> = {
  BASIC: '0',
  PRO: '49',
  ENTERPRISE: '99'
};

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  BASIC: 'TENANTS.PLAN_BASIC_SHORT',
  PRO: 'TENANTS.PLAN_PRO_SHORT',
  ENTERPRISE: 'TENANTS.PLAN_ENTERPRISE_SHORT'
};

export const PLANS: PlanOption[] = [
  {
    id: 'BASIC',
    name: 'TENANTS.PLAN_BASIC_NAME',
    price: '0',
    icon: 'fa-seedling',
    popular: false,
    description: 'TENANTS.PLAN_BASIC_SHORT',
    features: ['TENANTS.FEATURE_USERS_10', 'TENANTS.FEATURE_STORAGE_1GB', 'TENANTS.FEATURE_SUPPORT_EMAIL']
  },
  {
    id: 'PRO',
    name: 'TENANTS.PLAN_PRO_NAME',
    price: '49',
    icon: 'fa-rocket',
    popular: true,
    description: 'TENANTS.PLAN_PRO_SHORT',
    features: ['TENANTS.FEATURE_USERS_50', 'TENANTS.FEATURE_STORAGE_10GB', 'TENANTS.FEATURE_SUPPORT_PRIORITY', 'TENANTS.FEATURE_ADVANCED_ANALYTICS']
  },
  {
    id: 'ENTERPRISE',
    name: 'TENANTS.PLAN_ENTERPRISE_NAME',
    price: '99',
    icon: 'fa-building',
    popular: false,
    description: 'TENANTS.PLAN_ENTERPRISE_SHORT',
    features: ['TENANTS.FEATURE_USERS_UNLIMITED', 'TENANTS.FEATURE_STORAGE_UNLIMITED', 'TENANTS.FEATURE_SUPPORT_24_7', 'TENANTS.FEATURE_DEDICATED_ACCOUNT', 'TENANTS.FEATURE_CUSTOM_INTEGRATIONS']
  }
];