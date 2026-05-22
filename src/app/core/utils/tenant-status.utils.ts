export type SubscriptionStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'PAST_DUE' | 'CANCELED';
export type SubscriptionPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'hc-badge-success';
    case 'SUSPENDED': return 'hc-badge-error';
    case 'PENDING_PAYMENT': return 'hc-badge-warning';
    case 'PAST_DUE': return 'hc-badge-warning';
    case 'CANCELED': return 'hc-badge-muted';
    default: return 'hc-badge-muted';
  }
}

export function getPlanBadgeClass(plan: string): string {
  switch (plan) {
    case 'ENTERPRISE': return 'hc-badge-primary';
    case 'PRO': return 'hc-badge-success';
    case 'BASIC': return 'hc-badge-muted';
    default: return 'hc-badge-muted';
  }
}

export function getPlanLabelKey(plan: string): string {
  return 'TENANTS.PLAN_' + plan;
}