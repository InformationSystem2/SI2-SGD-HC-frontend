import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FieldDefinition {
  key: string;
  label: string;
  type: string;
  kind: string;
}

export interface ReportTypeDefinition {
  key: string;
  label: string;
  category: string;
  isAggregated: boolean;
  fields: FieldDefinition[];
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ReportRunRequest {
  reportType: string;
  selectedFields: string[];
  filters: ReportFilter[];
  sortField?: string;
  sortOrder?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface ReportResult {
  reportType: string;
  reportLabel: string;
  category: string;
  columns: string[];
  columnLabels: Record<string, string>;
  rows: Record<string, any>[];
  total: number;
  limit: number;
  offset: number;
  generatedAt: string;
  appliedFilters: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  department?: string;
  reportType: string;
  selectedFields: string[];
  filters: ReportFilter[];
  sortField?: string;
  sortOrder?: string;
  isShared: boolean;
  ownerId: string;
  ownerName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportTemplateRequest {
  name: string;
  description?: string;
  department?: string;
  reportType: string;
  selectedFields: string[];
  filters: ReportFilter[];
  sortField?: string;
  sortOrder?: string;
  isShared: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.fastApiUrl}/reports`;

  getCatalog(): Observable<ReportTypeDefinition[]> {
    return this.http.get<ReportTypeDefinition[]>(`${this.BASE}/catalog`);
  }

  runReport(req: ReportRunRequest): Observable<ReportResult> {
    return this.http.post<ReportResult>(`${this.BASE}/run`, req);
  }

  exportReport(req: ReportRunRequest, format: 'pdf' | 'excel' | 'html' | 'json'): Observable<Blob> {
    return this.http.post(`${this.BASE}/export`, req, {
      params: { format },
      responseType: 'blob'
    });
  }

  getTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.BASE}/templates`);
  }

  createTemplate(req: ReportTemplateRequest): Observable<ReportTemplate> {
    return this.http.post<ReportTemplate>(`${this.BASE}/templates`, req);
  }

  updateTemplate(id: string, req: ReportTemplateRequest): Observable<ReportTemplate> {
    return this.http.put<ReportTemplate>(`${this.BASE}/templates/${id}`, req);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/templates/${id}`);
  }
}
