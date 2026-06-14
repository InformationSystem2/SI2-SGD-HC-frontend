import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';

// ── Response interfaces ──────────────────────────────────────────────────────

export interface SubscriptionItem  { status: string; total: number; }
export interface CommercialItem    { plan:   string; total: number; }
export interface StorageItem       { month:  string; total_documents: number; }
export interface WorkflowItem      { status: string; total: number; }
export interface MedicalStudies    { total_studies: number; }
export interface CriticalAlertItem { id: string; status: string; issue_date: string; expiry_date: string; }

// ── Chart colour palette (robust for dark & light themes) ───────────────────

export const CHART_PALETTE = {
  subscriptions: ['#22c55e', '#f59e0b', '#ef4444', '#a855f7'],  // active, past_due, canceled, suspended
  plans:         ['#38bdf8', '#818cf8', '#fb923c'],               // basic, pro, enterprise
  storage:       ['#6366f1'],
  workflow:      ['#94a3b8', '#fbbf24', '#f87171', '#34d399'],   // draft, pending, rejected, finalized
};

/**
 * Returns Chart.js-compatible global options tuned for dark/light mode.
 * Reads CSS custom properties at call time so they reflect the current theme.
 */
export function getChartDefaults(): Partial<ChartConfiguration['options']> {
  const root   = getComputedStyle(document.documentElement);
  const text   = root.getPropertyValue('--hc-text-primary').trim()   || '#0F172A';
  const muted  = root.getPropertyValue('--hc-text-muted').trim()     || '#64748B';
  const grid   = root.getPropertyValue('--hc-border').trim()         || '#E2E8F0';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: text, font: { family: 'Inter, sans-serif', size: 12 } },
      },
      tooltip: {
        titleColor: '#ffffff',
        bodyColor:  '#ffffff',
      },
    },
    scales: {
      x: {
        ticks: { color: muted },
        grid:  { color: grid  },
      },
      y: {
        ticks: { color: muted },
        grid:  { color: grid  },
      },
    },
  } as Partial<ChartConfiguration['options']>;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly BASE = environment.fastApiUrl;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.auth.accessToken()}`);
  }

  // ── Super Admin ────────────────────────────────────────────────────────────

  /** Pie chart: subscription health (ACTIVE, PAST_DUE, CANCELED, SUSPENDED) */
  getSubscriptions(): Observable<ChartData<'pie'>> {
    return this.http
      .get<{ data: SubscriptionItem[] }>(
        `${this.BASE}/analytics/superadmin/subscriptions`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map(res => {
          const items  = res.data ?? [];
          const order  = ['ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED'];
          const sorted = order.map(s => items.find(i => i.status === s) ?? { status: s, total: 0 });
          return {
            labels:   sorted.map(i => i.status),
            datasets: [{
              data:            sorted.map(i => i.total),
              backgroundColor: CHART_PALETTE.subscriptions,
              borderWidth:     2,
              borderColor:     'transparent',
            }],
          };
        })
      );
  }

  /** Bar chart: commercial distribution (BASIC, PRO, ENTERPRISE) */
  getCommercialDistribution(): Observable<ChartData<'bar'>> {
    return this.http
      .get<{ data: CommercialItem[] }>(
        `${this.BASE}/analytics/superadmin/commercial-distribution`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map(res => {
          const items  = res.data ?? [];
          const order  = ['BASIC', 'PRO', 'ENTERPRISE'];
          const sorted = order.map(p => items.find(i => i.plan === p) ?? { plan: p, total: 0 });
          return {
            labels:   sorted.map(i => i.plan),
            datasets: [{
              label:           'Clínicas',
              data:            sorted.map(i => i.total),
              backgroundColor: CHART_PALETTE.plans,
              borderRadius:    6,
            }],
          };
        })
      );
  }

  /** Line chart: monthly document storage consumption */
  getStorageConsumption(): Observable<ChartData<'line'>> {
    return this.http
      .get<{ data: StorageItem[] }>(
        `${this.BASE}/analytics/superadmin/storage-consumption`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map(res => {
          const items = res.data ?? [];
          return {
            labels:   items.map(i => i.month),
            datasets: [{
              label:           'Documentos',
              data:            items.map(i => i.total_documents),
              borderColor:     CHART_PALETTE.storage[0],
              backgroundColor: CHART_PALETTE.storage[0] + '33',
              tension:         0.4,
              fill:            true,
              pointRadius:     4,
              pointBackgroundColor: CHART_PALETTE.storage[0],
            }],
          };
        })
      );
  }

  // ── Clinic Admin ───────────────────────────────────────────────────────────

  /** Doughnut chart: document workflow funnel (DRAFT, PENDING_REVIEW, REJECTED, FINALIZED) */
  getWorkflowFunnel(tenantId: string): Observable<ChartData<'doughnut'>> {
    return this.http
      .get<{ data: WorkflowItem[] }>(
        `${this.BASE}/analytics/clinic/${tenantId}/workflow`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map(res => {
          const items  = res.data ?? [];
          const order  = ['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'FINALIZED'];
          const sorted = order.map(s => items.find(i => i.status === s) ?? { status: s, total: 0 });
          return {
            labels:   sorted.map(i => i.status),
            datasets: [{
              data:            sorted.map(i => i.total),
              backgroundColor: CHART_PALETTE.workflow,
              borderWidth:     2,
              borderColor:     'transparent',
            }],
          };
        })
      );
  }

  /** Numeric card: total DICOM medical studies */
  getMedicalStudiesVolume(tenantId: string): Observable<number> {
    return this.http
      .get<{ data: MedicalStudies }>(
        `${this.BASE}/analytics/clinic/${tenantId}/medical-studies`,
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.data?.total_studies ?? 0));
  }

  /** Table: critical alerts (EXPIRING_SOON / EXPIRED documents) */
  getCriticalAlerts(tenantId: string): Observable<CriticalAlertItem[]> {
    return this.http
      .get<{ data: CriticalAlertItem[] }>(
        `${this.BASE}/analytics/clinic/${tenantId}/critical-alerts`,
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.data ?? []));
  }
}
