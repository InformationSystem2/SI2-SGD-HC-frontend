import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../../services/tenant.service';
import { TenantInfo } from '../../../models/tenant.model';
import { PLANS, PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, PLAN_DESCRIPTIONS, PlanLimits, isDowngrade } from '../../../../../core/utils/plan.utils';
import { environment } from '../../../../../../environments/environment';

interface UsageData {
  currentUsers: number;
  currentStorageMB: number;
  currentApiCalls: number;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe],
  templateUrl: './subscription.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscription implements OnInit {
  private tenantService = inject(TenantService);
  protected translate = inject(TranslateService);

  loading = signal(true);
  tenantInfo = signal<TenantInfo | null>(null);
  usage = signal<UsageData>({ currentUsers: 0, currentStorageMB: 0, currentApiCalls: 0 });
  planLimits = signal<PlanLimits>({ maxUsers: 10, maxStorageMB: 1000, maxApiCallsPerMonth: 1000 });

  subscriptionEndDate = signal<Date | null>(null);
  daysUntilExpiration = signal(0);
  isExpiringSoon = computed(() => {
    const days = this.daysUntilExpiration();
    return days <= 7 && days > 0;
  });
  isExpired = computed(() => this.daysUntilExpiration() <= 0);

  renewing = signal(false);
  showChangePlan = signal(false);
  selectedNewPlan = signal('');
  changingPlan = signal(false);
  downgradeWarnings = signal<string[]>([]);
  showDowngradeWarning = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  // Estados de Stripe en Modal
  showPaymentModal = signal(false);
  paymentIntentAction = signal<'renew' | 'change-plan'>('renew');
  paymentIntentPlan = signal<string>('');
  paymentIntentClientSecret = signal<string>('');
  paymentProcessing = signal(false);
  stripeError = signal<string | null>(null);

  stripe: any = null;
  card: any = null;

  readonly PLAN_PRICES = PLAN_PRICES;
  readonly PLAN_NAMES = PLAN_NAMES;
  readonly PLAN_DESCRIPTIONS = PLAN_DESCRIPTIONS;

  readonly plans = PLANS;

  userPercent = computed(() => {
    const limit = this.planLimits().maxUsers;
    if (limit >= 999999) return 0;
    return (this.usage().currentUsers / limit) * 100;
  });

  storagePercent = computed(() => {
    const limit = this.planLimits().maxStorageMB;
    if (limit >= 999999) return 0;
    return (this.usage().currentStorageMB / limit) * 100;
  });

  apiPercent = computed(() => {
    const limit = this.planLimits().maxApiCallsPerMonth;
    if (limit >= 999999) return 0;
    return (this.usage().currentApiCalls / limit) * 100;
  });

  expirationBadgeClass = computed(() => {
    const days = this.daysUntilExpiration();
    if (days <= 0) return 'bg-hc-error-bg text-hc-error border-hc-error/30';
    if (days <= 7) return 'bg-hc-error-bg text-hc-error border-hc-error/30';
    if (days <= 30) return 'bg-hc-warning-bg text-hc-warning border-hc-warning/30';
    return 'bg-hc-success-bg text-hc-success border-hc-success/30';
  });

  expirationBadgeText = computed(() => {
    const days = this.daysUntilExpiration();
    if (days <= 0) return this.translate.instant('SUBSCRIPTION.EXPIRED_DAYS', {days: Math.abs(days)});
    if (days === 1) return this.translate.instant('SUBSCRIPTION.EXPIRES_TOMORROW');
    if (days <= 7) return this.translate.instant('SUBSCRIPTION.EXPIRES_IN_DAYS', {days});
    if (days <= 30) return this.translate.instant('SUBSCRIPTION.DAYS_REMAINING', {days});
    return this.translate.instant('SUBSCRIPTION.DAYS_REMAINING', {days});
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.tenantService.getTenantInfo().subscribe({
      next: (data) => {
        this.tenantInfo.set(data);
        const plan = data.subscriptionPlan || 'BASIC';
        this.planLimits.set(PLAN_LIMITS[plan] || PLAN_LIMITS['BASIC']);
        this.simulateUsage(plan);

        if (data.subscriptionEndDate) {
          const endDate = new Date(data.subscriptionEndDate + 'T00:00:00');
          this.subscriptionEndDate.set(endDate);
          this.daysUntilExpiration.set(this.calculateDaysRemaining(endDate));
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private calculateDaysRemaining(endDate: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private simulateUsage(plan: string) {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['BASIC'];
    const seed = Date.now();

    if (plan === 'ENTERPRISE') {
      this.usage.set({
        currentUsers: Math.floor(Math.random() * 500) + 100,
        currentStorageMB: Math.floor(Math.random() * 50000) + 5000,
        currentApiCalls: Math.floor(Math.random() * 500000) + 50000
      });
    } else {
      const userSeed = (seed % 100) / 100;
      const storageSeed = ((seed * 7) % 100) / 100;
      const apiSeed = ((seed * 13) % 100) / 100;

      this.usage.set({
        currentUsers: Math.max(1, Math.floor(userSeed * limits.maxUsers * 0.7)),
        currentStorageMB: Math.max(100, Math.floor(storageSeed * limits.maxStorageMB * 0.5)),
        currentApiCalls: Math.max(50, Math.floor(apiSeed * limits.maxApiCallsPerMonth * 0.3))
      });
    }
  }

  getBarColor(percent: number): string {
    if (percent >= 90) return 'bg-hc-error';
    if (percent >= 75) return 'bg-hc-warning';
    if (percent >= 50) return 'bg-hc-warning';
    return 'bg-hc-primary';
  }

  getBarGradient(percent: number): string {
    if (percent >= 90) return 'bg-gradient-to-r from-hc-error to-hc-error';
    if (percent >= 75) return 'bg-gradient-to-r from-hc-warning to-hc-warning';
    if (percent >= 50) return 'bg-gradient-to-r from-hc-warning to-hc-warning';
    return 'bg-gradient-to-r from-hc-primary to-hc-primary-light';
  }

  formatNumber(n: number): string {
    if (n >= 999999) return this.translate.instant('SUBSCRIPTION.INFINITY');
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  formatStorage(mb: number): string {
    if (mb >= 999999) return this.translate.instant('SUBSCRIPTION.INFINITY');
    if (mb >= 1000) return (mb / 1000).toFixed(1) + this.translate.instant('SUBSCRIPTION.GB_LABEL');
    return mb + this.translate.instant('SUBSCRIPTION.MB_LABEL');
  }

  renewPlan(): void {
    const info = this.tenantInfo();
    if (!info) return;

    const plan = info.subscriptionPlan || 'BASIC';
    if (plan === 'BASIC') {
      // Renovar plan gratis de forma directa
      this.renewing.set(true);
      this.tenantService.renewSubscription(plan).subscribe({
        next: () => {
          this.renewing.set(false);
          this.loadData();
          this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_RENEWED'), 'success');
        },
        error: () => {
          this.renewing.set(false);
          this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_RENEW_ERROR'), 'error');
        }
      });
    } else {
      // Renovar plan de pago -> Stripe
      this.renewing.set(true);
      this.tenantService.createChangePlanPaymentIntent(plan).subscribe({
        next: (res) => {
          this.renewing.set(false);
          this.paymentIntentAction.set('renew');
          this.paymentIntentPlan.set(plan);
          this.paymentIntentClientSecret.set(res.clientSecret);
          this.showPaymentModal.set(true);
          this.stripeError.set(null);
          setTimeout(() => this.initializeStripeForModal(), 150);
        },
        error: (err) => {
          this.renewing.set(false);
          this.showMessage(err.error?.message ?? this.translate.instant('SUBSCRIPTION.PLAN_RENEW_ERROR'), 'error');
        }
      });
    }
  }

  openChangePlanModal(): void {
    const info = this.tenantInfo();
    if (!info) return;
    this.selectedNewPlan.set('');
    this.showChangePlan.set(true);
  }

  closeChangePlanModal(): void {
    this.showChangePlan.set(false);
    this.selectedNewPlan.set('');
    this.downgradeWarnings.set([]);
    this.showDowngradeWarning.set(false);
  }

  selectNewPlan(planId: string): void {
    this.selectedNewPlan.set(planId);
  }

  confirmPlanChange(): void {
    const info = this.tenantInfo();
    const newPlan = this.selectedNewPlan();
    if (!info || !newPlan || newPlan === info.subscriptionPlan) return;

    if (this.isDowngrade(info.subscriptionPlan, newPlan)) {
      const warnings = this.checkDowngradeWarnings(newPlan);
      if (warnings.length > 0) {
        this.downgradeWarnings.set(warnings);
        this.showDowngradeWarning.set(true);
        return;
      }
    }

    if (newPlan === 'BASIC') {
      // Plan gratis -> directo
      this.executePlanChange(newPlan);
    } else {
      // Plan de pago -> Crear Payment Intent en Stripe
      this.changingPlan.set(true);
      this.tenantService.createChangePlanPaymentIntent(newPlan).subscribe({
        next: (res) => {
          this.changingPlan.set(false);
          this.paymentIntentAction.set('change-plan');
          this.paymentIntentPlan.set(newPlan);
          this.paymentIntentClientSecret.set(res.clientSecret);
          this.showPaymentModal.set(true);
          this.stripeError.set(null);
          setTimeout(() => this.initializeStripeForModal(), 150);
        },
        error: (err) => {
          this.changingPlan.set(false);
          this.showMessage(err.error?.message ?? this.translate.instant('SUBSCRIPTION.PLAN_CHANGE_ERROR'), 'error');
        }
      });
    }
  }

  executePlanChange(newPlan: string): void {
    this.changingPlan.set(true);
    this.tenantService.changePlan(newPlan).subscribe({
      next: () => {
        this.changingPlan.set(false);
        this.closeChangePlanModal();
        this.loadData();
        this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_CHANGED'), 'success');
      },
      error: () => {
        this.changingPlan.set(false);
        this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_CHANGE_ERROR'), 'error');
      }
    });
  }

  // Métodos de Stripe en el Modal de pagos
  initializeStripeForModal(): void {
    const StripeConstructor = (window as any)['Stripe'];
    if (!StripeConstructor) {
      this.stripeError.set('No se pudo inicializar Stripe.js. Por favor, recarga la página.');
      return;
    }

    this.stripe = StripeConstructor(environment.stripePublishableKey);
    const elements = this.stripe.elements();

    const isDark = document.documentElement.classList.contains('dark');
    const style = {
      base: {
        color: isDark ? '#E8F0F8' : '#0F172A',
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        '::placeholder': {
          color: isDark ? '#4D6F8A' : '#94A3B8'
        }
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444'
      }
    };

    this.card = elements.create('card', { style, hidePostalCode: true });
    this.card.mount('#stripe-card-element');

    this.card.on('change', (event: any) => {
      if (event.error) {
        this.stripeError.set(event.error.message);
      } else {
        this.stripeError.set(null);
      }
    });
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.stripeError.set(null);
    this.paymentProcessing.set(false);
    if (this.card) {
      this.card.destroy();
      this.card = null;
    }
  }

  processStripePayment(): void {
    if (!this.stripe || !this.card) {
      this.stripeError.set('La pasarela de pagos no está lista.');
      return;
    }

    this.paymentProcessing.set(true);
    this.stripeError.set(null);

    const clientSecret = this.paymentIntentClientSecret();
    const action = this.paymentIntentAction();
    const plan = this.paymentIntentPlan();

    const info = this.tenantInfo();
    const adminName = info ? ((info.adminFirstName || '') + ' ' + (info.adminLastName || '')).trim() : '';
    const adminEmail = info ? (info.adminEmail || '') : '';

    const billing_details: any = {};
    if (adminName) billing_details.name = adminName;
    if (adminEmail) billing_details.email = adminEmail;

    this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.card,
        ...(Object.keys(billing_details).length > 0 ? { billing_details } : {})
      }
    }).then((result: any) => {
      if (result.error) {
        this.paymentProcessing.set(false);
        this.stripeError.set(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const paymentIntentId = result.paymentIntent.id;

        if (action === 'renew') {
          this.tenantService.renewSubscription(plan, paymentIntentId).subscribe({
            next: () => {
              this.closePaymentModal();
              this.loadData();
              this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_RENEWED'), 'success');
            },
            error: (err) => {
              this.paymentProcessing.set(false);
              this.stripeError.set(err.error?.message ?? this.translate.instant('SUBSCRIPTION.PLAN_RENEW_ERROR'));
            }
          });
        } else {
          this.tenantService.changePlan(plan, paymentIntentId).subscribe({
            next: () => {
              this.closePaymentModal();
              this.closeChangePlanModal();
              this.loadData();
              this.showMessage(this.translate.instant('SUBSCRIPTION.PLAN_CHANGED'), 'success');
            },
            error: (err) => {
              this.paymentProcessing.set(false);
              this.stripeError.set(err.error?.message ?? this.translate.instant('SUBSCRIPTION.PLAN_CHANGE_ERROR'));
            }
          });
        }
      } else {
        this.paymentProcessing.set(false);
        this.stripeError.set(this.translate.instant('ERRORS.PAYMENT_FAILED'));
      }
    });
  }

  isDowngrade(current: string, target: string): boolean {
    return isDowngrade(current, target);
  }

  checkDowngradeWarnings(newPlan: string): string[] {
    const limits = PLAN_LIMITS[newPlan];
    const usage = this.usage();
    const warnings: string[] = [];

    if (limits.maxUsers < 999999 && usage.currentUsers > limits.maxUsers) {
      warnings.push(this.translate.instant('SUBSCRIPTION.DOWNGRADE_WARNING_USERS', {current: usage.currentUsers, plan: this.translate.instant(PLAN_NAMES[newPlan]), max: limits.maxUsers}));
    }
    if (limits.maxStorageMB < 999999 && usage.currentStorageMB > limits.maxStorageMB) {
      warnings.push(this.translate.instant('SUBSCRIPTION.DOWNGRADE_WARNING_STORAGE', {current: this.formatStorage(usage.currentStorageMB), max: this.formatStorage(limits.maxStorageMB)}));
    }
    return warnings;
  }

  dismissDowngradeWarning(): void {
    this.showDowngradeWarning.set(false);
    this.downgradeWarnings.set([]);
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }

  getTranslatedPlanName(planId: string): string {
    const key = PLAN_NAMES[planId];
    return key ? this.translate.instant(key) : planId;
  }
}
