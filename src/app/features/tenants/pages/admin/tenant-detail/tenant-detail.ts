import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  faArrowLeft, faBan, faBuilding, faCalendar, faCheck,
  faDatabase, faExclamationTriangle, faPhone,
  faRocket, faSpinner, faUsers, faXmark,
  faProcedures, faFileAlt, faXRay, faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog';

type ConfirmAction = 'SUSPEND' | 'REACTIVATE';

@Component({
  selector: 'app-tenant-detail',
  imports: [FontAwesomeModule, TranslatePipe, DatePipe, DecimalPipe, ConfirmDialogComponent],
  templateUrl: './tenant-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantDetail implements OnInit {

  readonly tenantService = inject(TenantService);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);
  private translate  = inject(TranslateService);

  readonly faArrowLeft  = faArrowLeft;
  readonly faBuilding   = faBuilding;
  readonly faSpinner    = faSpinner;
  readonly faUsers      = faUsers;
  readonly faDatabase   = faDatabase;
  readonly faRocket     = faRocket;
  readonly faCalendar   = faCalendar;
  readonly faPhone      = faPhone;
  readonly faBan        = faBan;
  readonly faCheck      = faCheck;
  readonly faExclamationTriangle = faExclamationTriangle;
  readonly faXmark     = faXmark;

  showConfirmModal = signal(false);
  confirmAction    = signal<ConfirmAction | null>(null);
  confirmTitle     = signal('');
  confirmMessage   = signal('');

  showHardDeleteModal = signal(false);

  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.tenantService.getTenantById(id).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/tenants']);
  }

  openConfirm(action: ConfirmAction): void {
    const t = this.tenantService.currentTenant();
    if (!t) return;
    this.confirmAction.set(action);
    if (action === 'SUSPEND') {
      this.confirmTitle.set(this.translate.instant('TENANTS.CONFIRM_SUSPEND_TITLE'));
      this.confirmMessage.set(this.translate.instant('TENANTS.CONFIRM_SUSPEND', { name: t.name }));
    } else {
      this.confirmTitle.set(this.translate.instant('TENANTS.CONFIRM_REACTIVATE_TITLE'));
      this.confirmMessage.set(this.translate.instant('TENANTS.CONFIRM_REACTIVATE', { name: t.name }));
    }
    this.showConfirmModal.set(true);
  }

  closeConfirm(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set(null);
  }

  onConfirmAction(): void {
    const t = this.tenantService.currentTenant();
    if (!t) return;
    const action = this.confirmAction();
    if (!action) return;
    if (action === 'SUSPEND') {
      this.tenantService.updateStatus(t.id, 'SUSPEND').subscribe({
        next: () => { this.closeConfirm(); this.tenantService.refreshTenant(t.id); },
        error: (err) => this.showError(err.error?.error ?? 'Error'),
      });
    } else {
      this.tenantService.updateStatus(t.id, 'REACTIVATE').subscribe({
        next: () => { this.closeConfirm(); this.tenantService.refreshTenant(t.id); },
        error: (err) => this.showError(err.error?.error ?? 'Error'),
      });
    }
  }

  openHardDelete(): void {
    this.showHardDeleteModal.set(true);
  }

  closeHardDelete(): void {
    this.showHardDeleteModal.set(false);
  }

  onHardDeleteConfirm(): void {
    const t = this.tenantService.currentTenant();
    if (!t) return;
    this.tenantService.deleteTenant(t.id, t.name).subscribe({
      next: () => this.goBack(),
      error: (err) => this.showError(err.error?.error ?? 'Error'),
    });
    this.closeHardDelete();
  }

  getPercent(type: 'users' | 'storage' | 'api' | 'patients' | 'documents' | 'dicom' | 'roles'): number {
    const t = this.tenantService.currentTenant();
    if (!t) return 0;
    switch (type) {
      case 'users': return t.stats.maxUsers ? Math.round((t.stats.userCount / t.stats.maxUsers) * 100) : 0;
      case 'storage': return t.stats.maxStorageMB ? Math.round((t.stats.storageUsedMB / t.stats.maxStorageMB) * 100) : 0;
      case 'api': return t.stats.maxApiCalls ? Math.round((t.stats.apiCallsUsed / t.stats.maxApiCalls) * 100) : 0;
      case 'patients': return t.stats.maxPatients ? Math.round((t.stats.patientCount / t.stats.maxPatients) * 100) : 0;
      case 'documents': return t.stats.maxDocuments ? Math.round((t.stats.documentCount / t.stats.maxDocuments) * 100) : 0;
      case 'dicom': return t.stats.maxDicomStudies ? Math.round((t.stats.dicomStudyCount / t.stats.maxDicomStudies) * 100) : 0;
      case 'roles': return t.stats.maxStaffRoles ? Math.round((t.stats.roleCount / t.stats.maxStaffRoles) * 100) : 0;
    }
  }

  getStatusBadge(): string {
    const t = this.tenantService.currentTenant();
    if (!t) return 'hc-badge-muted';
    if (t.subscriptionStatus === 'ACTIVE') return 'hc-badge-success';
    if (t.subscriptionStatus === 'SUSPENDED') return 'hc-badge-error';
    if (t.subscriptionStatus === 'PENDING_PAYMENT') return 'hc-badge-warning';
    if (t.subscriptionStatus === 'PAST_DUE') return 'hc-badge-warning';
    return 'hc-badge-muted';
  }

  getPlanBadge(): string {
    const t = this.tenantService.currentTenant();
    if (!t) return 'hc-badge-muted';
    if (t.subscriptionPlan === 'ENTERPRISE') return 'hc-badge-primary';
    if (t.subscriptionPlan === 'PRO') return 'hc-badge-success';
    return 'hc-badge-muted';
  }

  getPlanLabel(): string {
    const t = this.tenantService.currentTenant();
    if (!t) return '';
    return this.translate.instant('TENANTS.PLAN_' + t.subscriptionPlan);
  }

  getUserPercent(): number {
    return this.getPercent('users');
  }

  getStoragePercent(): number {
    return this.getPercent('storage');
  }

  getApiPercent(): number {
    return this.getPercent('api');
  }

  getPatientPercent(): number {
    return this.getPercent('patients');
  }

  getDocPercent(): number {
    return this.getPercent('documents');
  }

  getDicomPercent(): number {
    return this.getPercent('dicom');
  }

  getRolePercent(): number {
    return this.getPercent('roles');
  }

  private showError(msg: string) {
    this.message.set(msg);
    this.messageType.set('error');
    setTimeout(() => this.message.set(null), 5000);
  }
}