import { describe, it, expect } from 'vitest';
import {
  UNLIMITED,
  isUnlimited,
  isDowngrade,
  formatLimitValue,
  formatStorageMB,
  getYearlySavings,
  getBillingCycleLabel,
  getPlanIcon,
  toPlanOption,
  BILLING_CYCLE_LABELS,
} from './plan.utils';
import { PlanDto } from '../../features/tenants/models/plan.model';

describe('plan.utils', () => {

  describe('UNLIMITED constant', () => {
    it('should be -1', () => {
      expect(UNLIMITED).toBe(-1);
    });
  });

  describe('isUnlimited', () => {
    it('returns true for -1', () => {
      expect(isUnlimited(-1)).toBe(true);
    });

    it('returns true for 0', () => {
      expect(isUnlimited(0)).toBe(true);
    });

    it('returns true for negative values', () => {
      expect(isUnlimited(-5)).toBe(true);
    });

    it('returns false for positive values', () => {
      expect(isUnlimited(1)).toBe(false);
      expect(isUnlimited(100)).toBe(false);
    });
  });

  describe('isDowngrade', () => {
    it('BASIC -> PRO is not a downgrade', () => {
      expect(isDowngrade('BASIC', 'PRO')).toBe(false);
    });

    it('PRO -> BASIC is a downgrade', () => {
      expect(isDowngrade('PRO', 'BASIC')).toBe(true);
    });

    it('ENTERPRISE -> PRO is a downgrade', () => {
      expect(isDowngrade('ENTERPRISE', 'PRO')).toBe(true);
    });

    it('BASIC -> ENTERPRISE is not a downgrade', () => {
      expect(isDowngrade('BASIC', 'ENTERPRISE')).toBe(false);
    });

    it('same plan is not a downgrade', () => {
      expect(isDowngrade('PRO', 'PRO')).toBe(false);
    });

    it('unknown plan defaults to weight 0', () => {
      expect(isDowngrade('PRO', 'UNKNOWN')).toBe(true);
      expect(isDowngrade('BASIC', 'UNKNOWN')).toBe(true);
    });
  });

  describe('formatLimitValue', () => {
    it('returns infinity for unlimited', () => {
      expect(formatLimitValue(-1)).toBe('∞');
      expect(formatLimitValue(0)).toBe('0');
    });

    it('returns K suffix for values >= 1000', () => {
      expect(formatLimitValue(1000)).toBe('1.0K');
      expect(formatLimitValue(1500)).toBe('1.5K');
      expect(formatLimitValue(10000)).toBe('10.0K');
    });

    it('returns plain number for values < 1000', () => {
      expect(formatLimitValue(5)).toBe('5');
      expect(formatLimitValue(999)).toBe('999');
    });
  });

  describe('formatStorageMB', () => {
    it('returns infinity for unlimited', () => {
      expect(formatStorageMB(-1)).toBe('∞');
    });

    it('converts to GB when >= 1024 MB', () => {
      expect(formatStorageMB(1024)).toBe('1.0 GB');
      expect(formatStorageMB(2048)).toBe('2.0 GB');
      expect(formatStorageMB(1536)).toBe('1.5 GB');
    });

    it('returns MB when < 1024', () => {
      expect(formatStorageMB(500)).toBe('500 MB');
      expect(formatStorageMB(100)).toBe('100 MB');
    });
  });

  describe('getYearlySavings', () => {
    it('returns empty when yearly >= monthly * 12', () => {
      expect(getYearlySavings(10, 120)).toBe('');
      expect(getYearlySavings(10, 130)).toBe('');
    });

    it('returns empty when monthly or yearly is 0', () => {
      expect(getYearlySavings(0, 100)).toBe('');
      expect(getYearlySavings(10, 0)).toBe('');
    });

    it('calculates savings correctly', () => {
      // monthly=25, yearly=250 -> fullYear=300, savings=50
      expect(getYearlySavings(25, 250)).toBe('$50');
    });

    it('handles non-round savings', () => {
      expect(getYearlySavings(30, 300)).toBe('$60');
    });
  });

  describe('getBillingCycleLabel', () => {
    it('returns translation key for MONTHLY', () => {
      expect(getBillingCycleLabel('MONTHLY')).toBe('TENANTS.MONTHLY');
    });

    it('returns translation key for YEARLY', () => {
      expect(getBillingCycleLabel('YEARLY')).toBe('TENANTS.YEARLY');
    });

    it('returns the raw string for unknown cycles', () => {
      expect(getBillingCycleLabel('WEEKLY')).toBe('WEEKLY');
    });
  });

  describe('getPlanIcon', () => {
    it('returns seedling for BASIC', () => {
      expect(getPlanIcon('BASIC')).toBe('fa-seedling');
    });

    it('returns rocket for PRO', () => {
      expect(getPlanIcon('PRO')).toBe('fa-rocket');
    });

    it('returns building for ENTERPRISE', () => {
      expect(getPlanIcon('ENTERPRISE')).toBe('fa-building');
    });

    it('returns box for unknown plan', () => {
      expect(getPlanIcon('CUSTOM')).toBe('fa-box');
    });

    it('is case-insensitive', () => {
      expect(getPlanIcon('basic')).toBe('fa-seedling');
      expect(getPlanIcon('pro')).toBe('fa-rocket');
    });
  });

  describe('toPlanOption', () => {
    const basePlan: PlanDto = {
      id: 'test-id',
      name: 'PRO',
      displayName: 'Profesional',
      description: 'Plan profesional',
      priceMonthly: 25,
      priceYearly: 250,
      cycleDays: 30,
      gracePeriodDays: 3,
      sortOrder: 2,
      limits: { maxUsers: 50, maxStorageMB: 10240 },
      features: { dicom_imaging: true, ocr_scanning: true, custom_branding: false }
    };

    it('builds a PlanOption from a PlanDto', () => {
      const option = toPlanOption(basePlan);
      expect(option.id).toBe('PRO');
      expect(option.name).toBe('TENANTS.PLAN_PRO_NAME');
      expect(option.icon).toBe('fa-rocket');
      expect(option.popular).toBe(true);
    });

    it('marks PRO as popular', () => {
      expect(toPlanOption(basePlan).popular).toBe(true);
    });

    it('does not mark BASIC as popular', () => {
      const basic = { ...basePlan, name: 'BASIC' };
      expect(toPlanOption(basic).popular).toBe(false);
    });

    it('includes user limit feature', () => {
      const option = toPlanOption(basePlan);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_USERS_N');
    });

    it('includes unlimited users feature when maxUsers is -1', () => {
      const enterprise = {
        ...basePlan,
        name: 'ENTERPRISE',
        limits: { maxUsers: -1, maxStorageMB: -1 }
      };
      const option = toPlanOption(enterprise);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_USERS_UNLIMITED');
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_STORAGE_UNLIMITED');
    });

    it('includes dicom feature when enabled', () => {
      const option = toPlanOption(basePlan);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_DICOM');
    });

    it('does not include dicom when disabled', () => {
      const noDicom = {
        ...basePlan,
        features: { ...basePlan.features, dicom_imaging: false }
      };
      const option = toPlanOption(noDicom);
      expect(option.features.map(f => f.key)).not.toContain('TENANTS.FEATURE_DICOM');
    });

    it('includes support_24_7 when available', () => {
      const plan247 = {
        ...basePlan,
        features: { ...basePlan.features, support_24_7: true, priority_support: true }
      };
      const option = toPlanOption(plan247);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_SUPPORT_24_7');
      expect(option.features.map(f => f.key)).not.toContain('TENANTS.FEATURE_SUPPORT_PRIORITY');
    });

    it('falls back to priority support when no 24/7', () => {
      const planPriority = {
        ...basePlan,
        features: { ...basePlan.features, support_24_7: false, priority_support: true }
      };
      const option = toPlanOption(planPriority);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_SUPPORT_PRIORITY');
    });

    it('falls back to email support when neither 24/7 nor priority', () => {
      const planBasic = {
        ...basePlan,
        features: { support_24_7: false, priority_support: false, dicom_imaging: false, ocr_scanning: false, custom_branding: false }
      };
      const option = toPlanOption(planBasic);
      expect(option.features.map(f => f.key)).toContain('TENANTS.FEATURE_SUPPORT_EMAIL');
    });
  });
});
