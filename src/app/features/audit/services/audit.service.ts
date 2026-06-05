import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLog, AuditPage, AuditFilters, IntegrityCheckResult } from '../models/audit.models';

@Injectable({ providedIn: 'root' })
export class AuditService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/audit`;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  list(filters: AuditFilters): Observable<AuditPage> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', filters.page)
      .set('size', filters.size);

    if (filters.tenantId) params = params.set('tenantId', filters.tenantId);
    if (filters.userIdentifier) params = params.set('userIdentifier', filters.userIdentifier);
    if (filters.actionType) params = params.set('actionType', filters.actionType);
    if (filters.resourceType) params = params.set('resourceType', filters.resourceType);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<AuditPage>(this.BASE, { params }).pipe(
      tap({
        next: () => this.loading.set(false),
        error: (err) => {
          this.error.set(err.error?.message ?? 'Error al cargar registros de auditoria');
          this.loading.set(false);
        },
      }),
    );
  }

  getById(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.BASE}/${id}`);
  }

  verifyIntegrity(id: string): Observable<IntegrityCheckResult> {
    return this.http.get<IntegrityCheckResult>(`${this.BASE}/${id}/verify`);
  }

  verifyAll(limit: number = 100): Observable<IntegrityCheckResult[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.post<IntegrityCheckResult[]>(
      `${this.BASE}/verify-all`, {}, { params }
    );
  }

  exportCsv(filters: AuditFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters.tenantId) params = params.set('tenantId', filters.tenantId);
    if (filters.userIdentifier) params = params.set('userIdentifier', filters.userIdentifier);
    if (filters.actionType) params = params.set('actionType', filters.actionType);
    if (filters.resourceType) params = params.set('resourceType', filters.resourceType);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get(`${this.BASE}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
