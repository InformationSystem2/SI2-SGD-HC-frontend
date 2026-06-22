import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { PlanService } from '../../../../../core/services/plan.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';
import { getBillingCycleLabel } from '../../../../../core/utils/plan.utils';
import { environment } from '../../../../../../environments/environment';

const PLAN_PRICES = {
  BASIC: '0',
  PRO: '49',
  ENTERPRISE: '99'
};

const PLAN_NAMES: Record<string, string> = {
  BASIC: 'TENANTS.PLAN_BASIC_NAME',
  PRO: 'TENANTS.PLAN_PRO_NAME',
  ENTERPRISE: 'TENANTS.PLAN_ENTERPRISE_NAME'
};

const PLANS = [
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
  adminName = signal<string>('');
  adminEmail = signal<string>('');

  selectedPlanOption = computed(() => {
    return PLANS.find(p => p.id === this.selectedPlan());
  });

  readonly PLAN_NAMES = PLAN_NAMES;

  stripe: any = null;
  card: any = null;

  ngOnInit(): void {
    const data = this.tenantService.getFlowData();
    if (!data) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    this.selectedPlan.set(data.selectedPlan);
    this.billingCycle.set(data.billingCycle || 'MONTHLY');
    this.billingCycleLabel.set(getBillingCycleLabel(data.billingCycle || 'MONTHLY'));

    this.planService.getPlan(data.selectedPlan).subscribe({
      next: (plan) => {
        const price = data.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
        this.planPrice.set(price.toString());
        this.planDisplayName.set(plan.displayName);
      },
      error: () => {
        const price = PLAN_PRICES[data.selectedPlan as keyof typeof PLAN_PRICES] || '0';
        this.planPrice.set(price);
        this.planDisplayName.set(this.translate.instant(PLAN_NAMES[data.selectedPlan] || data.selectedPlan));
      }
    });

    const name = (data.registrationData?.adminFirstName || '') + ' ' + (data.registrationData?.adminLastName || '');
    this.adminName.set(name.trim());
    this.adminEmail.set(data.registrationData?.adminEmail || '');

    if (data.selectedPlan !== 'BASIC') {
      // Esperar un instante para que el div esté renderizado en el DOM
      setTimeout(() => {
        this.initializeStripe();
      }, 150);
    }
  }

  initializeStripe(): void {
    const StripeConstructor = (window as any)['Stripe'];
    if (!StripeConstructor) {
      console.error('Stripe.js no se ha cargado en el documento html.');
      this.tenantService.error.set('No se pudo cargar la pasarela de pagos. Por favor, recarga la página.');
      return;
    }

    this.stripe = StripeConstructor(environment.stripePublishableKey);
    const elements = this.stripe.elements();

    const isDark = document.documentElement.classList.contains('dark');
    const style = {
      base: {
        color: isDark ? '#E8F0F8' : '#0F172A',
        fontFamily: 'Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
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
    this.card.mount('#card-element');

    this.card.on('change', (event: any) => {
      if (event.error) {
        this.tenantService.error.set(event.error.message);
      } else {
        this.tenantService.error.set(null);
      }
    });
  }

  confirmPayment(): void {
    this.processing.set(true);
    this.tenantService.error.set(null);

    const flowData = this.tenantService.getFlowData();
    if (!flowData) {
      this.processing.set(false);
      this.tenantService.error.set(this.translate.instant('ERRORS.SESSION_EXPIRED'));
      return;
    }

    if (this.selectedPlan() === 'BASIC') {
      // Plan Gratuito (BASIC) — Bypass de Stripe
      this.tenantService.processPayment().subscribe({
        next: () => {
          this.processing.set(false);
          this.router.navigate(['/tenants/success']);
        },
        error: (err) => {
          this.processing.set(false);
          this.tenantService.error.set(err.error?.message ?? this.translate.instant('ERRORS.PAYMENT_FAILED'));
        }
      });
    } else {
      // Plan de Pago (PRO / ENTERPRISE) — Procesar con Stripe
      if (!this.stripe || !this.card) {
        this.processing.set(false);
        this.tenantService.error.set('La pasarela de pagos de Stripe no está inicializada.');
        return;
      }

      this.tenantService.createOnboardingPaymentIntent(flowData.sessionToken).subscribe({
        next: (intentRes) => {
          const clientSecret = intentRes.clientSecret;
          const adminName = (flowData.registrationData?.adminFirstName || '') + ' ' + (flowData.registrationData?.adminLastName || '');
          const adminEmail = flowData.registrationData?.adminEmail || '';

          // Confirmar el pago en Stripe
          this.stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: adminName.trim(),
                email: adminEmail.trim()
              }
            }
          }).then((result: any) => {
            if (result.error) {
              this.processing.set(false);
              this.tenantService.error.set(result.error.message);
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
              // Pago aprobado. Registrar tenant en backend enviando el paymentIntent.id
              this.tenantService.processPayment(result.paymentIntent.id).subscribe({
                next: () => {
                  this.processing.set(false);
                  this.router.navigate(['/tenants/success']);
                },
                error: (err) => {
                  this.processing.set(false);
                  this.tenantService.error.set(err.error?.message ?? this.translate.instant('ERRORS.PAYMENT_FAILED'));
                }
              });
            } else {
              this.processing.set(false);
              this.tenantService.error.set(this.translate.instant('ERRORS.PAYMENT_FAILED'));
            }
          });
        },
        error: (err) => {
          this.processing.set(false);
          this.tenantService.error.set(err.error?.message ?? this.translate.instant('ERRORS.PAYMENT_FAILED'));
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants/register']);
  }
}
