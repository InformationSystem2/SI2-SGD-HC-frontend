import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../../services/tenant.service';
import { BrandingService } from '../../../../../core/services/branding.service';
import { StorageService } from '../../../../../core/services/storage.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Info implements OnInit {
  private tenantService = inject(TenantService);
  protected brandingService = inject(BrandingService);
  protected storageService = inject(StorageService);
  protected translate = inject(TranslateService);
  readonly auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  clinicAddress = signal('');
  tenantSlug = signal('');
  tenantPlan = signal('');
  tenantStatus = signal('');
  tenantStartDate = signal('');
  adminFullName = signal('');
  adminEmail = signal('');
  adminPhone = signal('');
  maxUsers = signal(0);
  usersCount = signal(0);
  maxStorage = signal(0);
  storageUsed = signal(0);
  maxApiCalls = signal(0);
  apiCalls = signal(0);
  maxPatients = signal(0);
  patientsCount = signal(0);
  maxDocuments = signal(0);
  documentsCount = signal(0);
  maxDicomStudies = signal(0);
  dicomStudiesCount = signal(0);
  maxRoles = signal(0);
  rolesCount = signal(0);
  tenantBillingCycle = signal('MONTHLY');
  editingInfo = signal(false);
  infoForm = signal({ name: '', email: '', phone: '', address: '' });
  clinicLogoUrl = signal('');
  logoUploading = signal(false);
  dragOverLogo = signal(false);
  tenantTimezone = signal('');
  tenantLocale = signal('');
  tenantDateFormat = signal('');
  tenantCurrency = signal('');

  ngOnInit() {
    this.loadTenantInfo();
  }

  loadTenantInfo() {
    this.loading.set(true);

    forkJoin({
      info: this.tenantService.getTenantInfo(),
      settings: this.tenantService.getSettings(),
      stats: this.tenantService.getTenantStats()
    }).subscribe({
      next: ({ info, settings, stats }) => {
        this.brandingService.tenantName.set(info.name || '');
        this.clinicAddress.set(info.address || '');
        this.tenantSlug.set(info.slug || '');
        this.tenantPlan.set(info.subscriptionPlan || 'BASIC');
        this.tenantStatus.set(info.subscriptionStatus || 'ACTIVE');
        this.tenantStartDate.set(info.subscriptionStartDate ? this.formatDate(info.subscriptionStartDate) : '—');
        if (info.adminFirstName) {
          this.adminFullName.set(`${info.adminFirstName} ${info.adminLastName || ''}`.trim());
        }
        this.adminEmail.set(info.adminEmail || '');
        this.adminPhone.set(info.adminPhone || '');

        this.infoForm.set({
          name: info.name || '',
          email: info.email || '',
          phone: info.phone || '',
          address: info.address || ''
        });

        this.maxUsers.set(stats.maxUsers);
        this.maxStorage.set(stats.maxStorageMB);
        this.maxApiCalls.set(stats.maxApiCalls);
        this.usersCount.set(stats.userCount);
        this.storageUsed.set(stats.storageUsedMB);
        this.apiCalls.set(stats.apiCallsUsed);
        this.maxPatients.set(stats.maxPatients);
        this.patientsCount.set(stats.patientCount);
        this.maxDocuments.set(stats.maxDocuments);
        this.documentsCount.set(stats.documentCount);
        this.maxDicomStudies.set(stats.maxDicomStudies);
        this.dicomStudiesCount.set(stats.dicomStudyCount);
        this.maxRoles.set(stats.maxStaffRoles);
        this.rolesCount.set(stats.roleCount);
        this.tenantBillingCycle.set(info.billingCycle || 'MONTHLY');

        if (settings.regional) {
          this.tenantTimezone.set(settings.regional.timezone || '');
          this.tenantLocale.set(settings.regional.locale || '');
          this.tenantDateFormat.set(settings.regional.dateFormat || '');
          this.tenantCurrency.set(settings.regional.currency || '');
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.tenantSlug.set(this.storageService.getTenantSlug() || 'clinica-demo');
      }
    });

    this.loadLogoFromBranding();
  }

  private loadLogoFromBranding() {
    const branding = this.brandingService.branding();
    if (branding) {
      let url = branding.logo_url || branding.branding?.logo_url || '';
      this.clinicLogoUrl.set(this.normalizeUrl(url));
    } else {
      this.brandingService.load();
      setTimeout(() => {
        const b = this.brandingService.branding();
        if (b) {
          let url = b.logo_url || b.branding?.logo_url || '';
          this.clinicLogoUrl.set(this.normalizeUrl(url));
        }
      }, 500);
    }
  }

  private formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }

  getUsagePercent(current: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  startEditInfo() {
    this.editingInfo.set(true);
  }

  cancelEditInfo() {
    const f = this.infoForm();
    this.clinicAddress.set(f.address);
    this.editingInfo.set(false);
  }

  updateInfoField(field: string, value: string) {
    this.infoForm.update(f => ({ ...f, [field]: value }));
  }

  saveInfo() {
    const data = this.infoForm();
    this.saving.set(true);
    this.tenantService.updateTenantInfo({
      name: this.auth.hasPermission('tenant:update:name') ? data.name : undefined,
      email: this.auth.hasPermission('tenant:update:email') ? data.email : undefined,
      phone: this.auth.hasPermission('tenant:update:phone') ? data.phone : undefined,
      address: this.auth.hasPermission('tenant:update:address') ? data.address : undefined,
      logoUrl: this.auth.hasPermission('tenant:update:logo_url') ? this.clinicLogoUrl() : undefined
    }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.editingInfo.set(false);
        this.tenantPlan.set(updated.subscriptionPlan || this.tenantPlan());
        this.adminFullName.set(updated.adminFirstName ? `${updated.adminFirstName} ${updated.adminLastName || ''}`.trim() : this.adminFullName());
        this.adminEmail.set(updated.adminEmail || this.adminEmail());
        this.adminPhone.set(updated.adminPhone || this.adminPhone());
        this.brandingService.tenantName.set(updated.name || '');
        if (typeof localStorage !== 'undefined') localStorage.setItem('tenant_name_cache', updated.name || '');
        this.brandingService.load();
        this.showMessage(this.translate.instant('CLINIC.SUCCESS'), 'success');
      },
      error: () => {
        this.saving.set(false);
        this.showMessage(this.translate.instant('CLINIC.ERROR'), 'error');
      }
    });
  }

  private normalizeUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      return `${baseUrl}${url}`;
    }
    return url;
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadClinicLogo(input.files[0]);
  }

  onLogoDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOverLogo.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadClinicLogo(file);
    }
  }

  onLogoDragOver(event: DragEvent) {
    event.preventDefault();
    if (this.editingInfo()) {
      this.dragOverLogo.set(true);
    }
  }

  private uploadClinicLogo(file: File) {
    if (!this.auth.hasPermission('tenant:update:logo_url')) {
      this.showMessage('No tienes permiso para actualizar el logo', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showMessage(this.translate.instant('COMMON.FILE_TOO_BIG'), 'error');
      return;
    }
    this.logoUploading.set(true);
    this.brandingService.uploadLogoUrl(file).subscribe({
      next: (res: any) => {
        this.clinicLogoUrl.set(this.normalizeUrl(res.url));
        this.brandingService.load();
        this.logoUploading.set(false);
        this.showMessage(this.translate.instant('SUCCESS.LOGO_UPLOADED'), 'success');
      },
      error: () => {
        this.logoUploading.set(false);
        this.showMessage(this.translate.instant('ERRORS.ERROR_SAVE_CONFIG'), 'error');
      }
    });
  }

  saveTenantAddress() {
    if (this.auth.hasPermission('tenant:update:address')) {
      this.tenantService.updateTenantInfo({ address: this.clinicAddress() }).subscribe({});
    }
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }

  goBack() {
    history.back();
  }
}