import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserInjured, faFileWaveform, faFilePen, faFileCircleCheck,
  faFileCircleXmark, faUserPlus, faCloudArrowUp, faClipboardList,
  faCalendarCheck, faArrowRight, faMicroscope, faBell, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { PatientService } from '../../../patients/services/patient.service';
import { DocumentService } from '../../../documents/services/document.service';
import {
  AnalyticsService,
  CriticalAlertItem,
  getChartDefaults,
} from '../../services/analytics.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [FontAwesomeModule, TranslatePipe, BaseChartDirective],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {

  // ── DI ──────────────────────────────────────────────────────────────────────
  private router          = inject(Router);
  readonly auth           = inject(AuthService);
  readonly patientService = inject(PatientService);
  readonly documentService= inject(DocumentService);
  private analytics       = inject(AnalyticsService);
  private translate       = inject(TranslateService);
  private cdr             = inject(ChangeDetectorRef);

  // ── Icons ────────────────────────────────────────────────────────────────────
  readonly faUserInjured      = faUserInjured;
  readonly faFileWaveform     = faFileWaveform;
  readonly faFilePen          = faFilePen;
  readonly faFileCircleCheck  = faFileCircleCheck;
  readonly faFileCircleXmark  = faFileCircleXmark;
  readonly faUserPlus         = faUserPlus;
  readonly faCloudArrowUp     = faCloudArrowUp;
  readonly faClipboardList    = faClipboardList;
  readonly faCalendarCheck    = faCalendarCheck;
  readonly faArrowRight       = faArrowRight;
  readonly faMicroscope       = faMicroscope;
  readonly faBell             = faBell;
  readonly faTriangleExclamation = faTriangleExclamation;

  // ── Role helpers ─────────────────────────────────────────────────────────────
  readonly isSuperAdmin = computed(() => this.auth.roles().includes('ROLE_SUPERUSER'));
  readonly isAdmin      = computed(() => this.auth.roles().includes('ROLE_ADMIN'));

  // ── Existing computed (used by non-admin view) ───────────────────────────────
  readonly totalPatients  = computed(() => this.patientService.patients().length);
  readonly totalDocs      = computed(() => this.documentService.documents().length);
  readonly completedDocs  = computed(() =>
    this.documentService.documents().filter(d => d.status === 'COMPLETED').length
  );
  readonly pendingDocs    = computed(() =>
    this.documentService.documents().filter(d => d.status === 'PENDING_SIGNATURE').length
  );
  readonly recentDocs     = computed(() =>
    [...this.documentService.documents()]
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .slice(0, 5)
  );

  readonly today = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Analytics state ──────────────────────────────────────────────────────────

  // Super Admin
  subscriptionsData = signal<ChartData<'pie'> | null>(null);
  commercialData    = signal<ChartData<'bar'> | null>(null);
  storageData       = signal<ChartData<'line'> | null>(null);

  // Clinic Admin
  workflowData      = signal<ChartData<'doughnut'> | null>(null);
  medicalStudies    = signal<number | null>(null);
  criticalAlerts    = signal<CriticalAlertItem[]>([]);

  analyticsLoading  = signal(false);
  analyticsError    = signal<string | null>(null);

  // ── Chart options ─────────────────────────────────────────────────────────────
  pieOptions:      ChartConfiguration<'pie'>['options']      = {};
  barOptions:      ChartConfiguration<'bar'>['options']      = {};
  lineOptions:     ChartConfiguration<'line'>['options']     = {};
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {};

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  constructor() {
    // Re-build chart options whenever the language changes (theme may also change)
    effect(() => {
      this.translate.onLangChange.subscribe(() => this.buildChartOptions());
    });
  }

  ngOnInit(): void {
    this.buildChartOptions();

    if (this.isSuperAdmin()) {
      this.loadSuperAdminAnalytics();
    } else if (this.isAdmin()) {
      this.patientService.getPatients().subscribe();
      this.documentService.getAll().subscribe();
      this.loadAdminAnalytics();
    } else {
      // Default roles: load existing patient/document data
      this.patientService.getPatients().subscribe();
      this.documentService.getAll().subscribe();
    }
  }

  // ── Private loaders ───────────────────────────────────────────────────────────

  private buildChartOptions(): void {
    const base = getChartDefaults();

    this.pieOptions = {
      ...base,
      scales: undefined,   // pie has no axes
    } as ChartConfiguration<'pie'>['options'];

    this.doughnutOptions = {
      ...base,
      scales: undefined,
      cutout: '65%',
    } as ChartConfiguration<'doughnut'>['options'];

    this.barOptions = {
      ...base,
    } as ChartConfiguration<'bar'>['options'];

    this.lineOptions = {
      ...base,
    } as ChartConfiguration<'line'>['options'];

    this.cdr.markForCheck();
  }

  private loadSuperAdminAnalytics(): void {
    this.analyticsLoading.set(true);

    this.analytics.getSubscriptions().subscribe({
      next:  d => { this.subscriptionsData.set(d); this.cdr.markForCheck(); },
      error: () => this.analyticsError.set('ERRORS.DEFAULT'),
    });

    this.analytics.getCommercialDistribution().subscribe({
      next:  d => { this.commercialData.set(d); this.cdr.markForCheck(); },
      error: () => this.analyticsError.set('ERRORS.DEFAULT'),
    });

    this.analytics.getStorageConsumption().subscribe({
      next:  d => { this.storageData.set(d); this.analyticsLoading.set(false); this.cdr.markForCheck(); },
      error: () => { this.analyticsError.set('ERRORS.DEFAULT'); this.analyticsLoading.set(false); },
    });
  }

  private loadAdminAnalytics(): void {
    const tenantId = this.auth.tenantId();
    if (!tenantId) return;

    this.analyticsLoading.set(true);

    this.analytics.getWorkflowFunnel(tenantId).subscribe({
      next:  d => { this.workflowData.set(d); this.cdr.markForCheck(); },
      error: () => this.analyticsError.set('ERRORS.DEFAULT'),
    });

    this.analytics.getMedicalStudiesVolume(tenantId).subscribe({
      next:  n => { this.medicalStudies.set(n); this.cdr.markForCheck(); },
      error: () => this.analyticsError.set('ERRORS.DEFAULT'),
    });

    this.analytics.getCriticalAlerts(tenantId).subscribe({
      next:  a => { this.criticalAlerts.set(a); this.analyticsLoading.set(false); this.cdr.markForCheck(); },
      error: () => { this.analyticsError.set('ERRORS.DEFAULT'); this.analyticsLoading.set(false); },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  alertBadgeClass(status: string): string {
    return status === 'EXPIRED' ? 'hc-badge-error' : 'hc-badge-warning';
  }

  goTo(path: string): void { this.router.navigate([path]); }
}