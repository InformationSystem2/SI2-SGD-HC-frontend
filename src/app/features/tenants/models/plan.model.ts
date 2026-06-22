export interface PlanDto {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  cycleDays: number;
  gracePeriodDays: number;
  sortOrder: number;
  limits: Record<string, number>;
  features: Record<string, boolean>;
}
