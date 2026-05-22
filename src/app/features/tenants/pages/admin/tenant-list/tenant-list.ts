import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { TenantListItem } from '../../../models/tenant.model';
import {
  faBan, faBuilding, faCheck, faCircleCheck, faCircleXmark,
  faEye, faSearch, faSpinner, faTrash, faUsers, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmType } from '../../../components/confirm-dialog/confirm-dialog';

type ActionType = 'SUSPEND' | 'REACTIVATE' | 'HARD_DELETE';

@Component({
  selector: 'app-tenant-list',
  imports: [FontAwesomeModule, TranslatePipe, ConfirmDialogComponent],
  templateUrl: './tenant-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantList implements OnInit {

  readonly tenantService = inject(TenantService);
  private router         = inject(Router);
  private translate      = inject(TranslateService);

  readonly faBuilding    = faBuilding;
  readonly faSpinner    = faSpinner;
  readonly faUsers      = faUsers;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faEye         = faEye;
  readonly faSearch     = faSearch;
  readonly faTrash       = faTrash;
  readonly faBan         = faBan;
  readonly faCheck      = faCheck;
  readonly faXmark      = faXmark;

  readonly PAGE_SIZE = 20;
  readonly page       = signal(0);
  readonly search     = signal('');
  readonly searchValue = signal('');

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly paged      = () => this.tenantService.tenants();
  readonly totalItems = () => this.tenantService.totalItems();
  readonly totalPages = () => Math.max(1, Math.ceil(this.totalItems() / this.PAGE_SIZE));

  readonly visiblePages = () => {
    const total = this.totalPages(), cur = this.page();
    const start = Math.max(0, Math.min(cur - 2, total - 5));
    const end   = Math.min(total - 1, start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  };

  showConfirmModal = signal(false);
  confirmTenant    = signal<TenantListItem | null>(null);
  confirmAction    = signal<ActionType | null>(null);
  confirmTitle     = signal('');
  confirmMessage   = signal('');

  showHardDeleteModal = signal(false);
  hardDeleteTenant    = signal<TenantListItem | null>(null);

  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.tenantService.getTenants(this.page(), this.PAGE_SIZE, this.search() || undefined).subscribe();
  }

  prevPage()          { this.page.update(p => Math.max(0, p - 1)); this.load(); }
  nextPage()          { this.page.update(p => Math.min(this.totalPages() - 1, p + 1)); this.load(); }
  goToPage(n: number)  { this.page.set(n); this.load(); }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(value);
      this.page.set(0);
      this.load();
    }, 300);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/dashboard/admin/tenants', id]);
  }

  openConfirm(tenant: TenantListItem, action: ActionType) {
    this.confirmTenant.set(tenant);
    this.confirmAction.set(action);
    if (action === 'SUSPEND') {
      this.confirmTitle.set(this.translate.instant('TENANTS.CONFIRM_SUSPEND_TITLE'));
      this.confirmMessage.set(this.translate.instant('TENANTS.CONFIRM_SUSPEND', { name: tenant.name }));
    } else {
      this.confirmTitle.set(this.translate.instant('TENANTS.CONFIRM_REACTIVATE_TITLE'));
      this.confirmMessage.set(this.translate.instant('TENANTS.CONFIRM_REACTIVATE', { name: tenant.name }));
    }
    this.showConfirmModal.set(true);
  }

  closeConfirm(): void {
    this.showConfirmModal.set(false);
    this.confirmTenant.set(null);
    this.confirmAction.set(null);
  }

  onConfirmAction(): void {
    const t = this.confirmTenant();
    const a = this.confirmAction();
    if (!t || !a) return;
    if (a === 'SUSPEND') {
      this.tenantService.updateStatus(t.id, 'SUSPEND').subscribe({
        next: () => { this.closeConfirm(); this.load(); },
        error: (err) => this.showError(err.error?.error ?? 'Error'),
      });
    } else if (a === 'REACTIVATE') {
      this.tenantService.updateStatus(t.id, 'REACTIVATE').subscribe({
        next: () => { this.closeConfirm(); this.load(); },
        error: (err) => this.showError(err.error?.error ?? 'Error'),
      });
    } else {
      this.tenantService.deleteTenant(t.id, 'SOFT').subscribe({
        next: () => { this.closeConfirm(); this.load(); },
        error: (err) => this.showError(err.error?.error ?? 'Error'),
      });
    }
  }

  openHardDelete(tenant: TenantListItem): void {
    this.hardDeleteTenant.set(tenant);
    this.showHardDeleteModal.set(true);
  }

  closeHardDelete(): void {
    this.showHardDeleteModal.set(false);
    this.hardDeleteTenant.set(null);
  }

  onHardDeleteConfirm(): void {
    const t = this.hardDeleteTenant();
    if (!t) return;
    this.tenantService.deleteTenant(t.id, t.name).subscribe({
      next: () => { this.closeHardDelete(); this.load(); },
      error: (err) => this.showError(err.error?.error ?? 'Error'),
    });
  }

  getStatusBadge(tenant: TenantListItem): string {
    if (tenant.subscriptionStatus === 'SUSPENDED') return 'hc-badge-error';
    if (tenant.subscriptionStatus === 'ACTIVE') return 'hc-badge-success';
    if (tenant.subscriptionStatus === 'PENDING_PAYMENT') return 'hc-badge-warning';
    if (tenant.subscriptionStatus === 'PAST_DUE') return 'hc-badge-warning';
    if (tenant.subscriptionStatus === 'CANCELED') return 'hc-badge-error';
    return 'hc-badge-muted';
  }

  getStatusIcon(tenant: TenantListItem) {
    if (tenant.subscriptionStatus === 'SUSPENDED') return this.faCircleXmark;
    if (tenant.subscriptionStatus === 'ACTIVE') return this.faCircleCheck;
    if (tenant.subscriptionStatus === 'PENDING_PAYMENT') return this.faCircleXmark;
    if (tenant.subscriptionStatus === 'PAST_DUE') return this.faCircleXmark;
    if (tenant.subscriptionStatus === 'CANCELED') return this.faCircleXmark;
    return this.faCircleCheck;
  }

  getActionIcon(action: ActionType): any {
    if (action === 'REACTIVATE') return this.faCheck;
    if (action === 'SUSPEND') return this.faBan;
    return this.faTrash;
  }

  private showError(msg: string) {
    this.message.set(msg);
    this.messageType.set('error');
    setTimeout(() => this.message.set(null), 5000);
  }
}