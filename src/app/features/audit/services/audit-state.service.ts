import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuditService } from './audit.service';
import { AuditFilters, AuditLog, AuditPage } from '../models/audit.models';

@Injectable({ providedIn: 'root' })
export class AuditState {

  private readonly auditService = inject(AuditService);

  readonly filters = signal<AuditFilters>({ page: 0, size: 7 });
  readonly selectedLog = signal<AuditLog | null>(null);
  readonly showFilters = signal(false);

  readonly auditPage = signal<AuditPage | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly reloadTrigger = signal(0);

  readonly logs = computed(() => this.auditPage()?.content ?? []);
  readonly totalElements = computed(() => this.auditPage()?.totalElements ?? 0);
  readonly totalPages = computed(() => this.auditPage()?.totalPages ?? 0);
  readonly currentPage = computed(() => this.auditPage()?.number ?? 0);

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.tenantId || f.userIdentifier || f.actionType || f.resourceType || f.dateFrom || f.dateTo);
  });

  constructor() {
    effect(() => {
      this.reloadTrigger(); // tracked — forces re-run on refresh()
      this.loadAudit(this.filters());
    });
  }

  refresh() {
    this.reloadTrigger.update(v => v + 1);
  }

  loadAudit(filters: AuditFilters) {
    this.isLoading.set(true);
    this.error.set(null);

    this.auditService.list(filters).subscribe({
      next: (page) => {
        this.auditPage.set(page);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error al cargar registros de auditoria');
        this.isLoading.set(false);
      },
    });
  }

  updateFilters(partial: Partial<AuditFilters>) {
    this.filters.update(current => ({
      ...current,
      ...partial,
      page: 'page' in partial ? (partial.page ?? 0) : 0,
    }));
  }

  resetFilters() {
    this.filters.set({ page: 0, size: 7 });
  }

  selectLog(log: AuditLog | null) {
    this.selectedLog.set(log);
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }
}
