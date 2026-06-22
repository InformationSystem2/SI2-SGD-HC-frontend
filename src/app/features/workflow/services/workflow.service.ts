import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddCommentRequest,
  Workflow,
  WorkflowComment,
  WorkflowCreateRequest,
  WorkflowEvent,
  WorkflowListStats,
  WorkflowStatus,
} from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/workflows`;
  private readonly EVENTS_BASE = `${environment.apiUrl}/workflow-events`;
  private readonly COMMENTS_BASE = `${environment.apiUrl}/workflow-comments`;

  readonly workflows     = signal<Workflow[]>([]);
  readonly assignedWorkflows = signal<Workflow[]>([]);
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly selectedWorkflow = signal<Workflow | null>(null);

  getMyWorkflows(status?: WorkflowStatus) {
    this.loading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.http.get<Workflow[]>(this.BASE, { params }).pipe(
      tap(wfs => { this.workflows.set(wfs); this.loading.set(false); }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar flujos');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getWorkflowsAssignedToMe(status?: WorkflowStatus) {
    this.loading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.http.get<Workflow[]>(`${this.BASE}/assigned-to-me`, { params }).pipe(
      tap(wfs => { this.assignedWorkflows.set(wfs); this.loading.set(false); }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar flujos asignados');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getWorkflow(id: string) {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Workflow>(`${this.BASE}/${id}`).pipe(
      tap(wf => { this.selectedWorkflow.set(wf); this.loading.set(false); }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar flujo');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  createWorkflow(req: WorkflowCreateRequest) {
    return this.http.post<Workflow>(this.BASE, req);
  }

  cancelWorkflow(id: string) {
    return this.http.post<{ message: string }>(`${this.BASE}/${id}/cancel`, null);
  }

  resubmitDocument(workflowId: string, documentId: string, selectedVersion: number, reviewerId?: string) {
    let url = `${this.BASE}/${workflowId}/documents/${documentId}/resubmit?selectedVersion=${selectedVersion}`;
    if (reviewerId) {
      url += `&reviewerId=${reviewerId}`;
    }
    return this.http.post<Workflow>(url, null);
  }

  getStats() {
    return this.http.get<WorkflowListStats>(`${this.BASE}/stats`);
  }

  getDocumentHistory(documentId: string) {
    return this.http.get<WorkflowEvent[]>(`${this.EVENTS_BASE}/document/${documentId}`);
  }

  getWorkflowHistory(workflowId: string) {
    return this.http.get<WorkflowEvent[]>(`${this.EVENTS_BASE}/workflow/${workflowId}`);
  }

  addComment(req: AddCommentRequest) {
    return this.http.post<WorkflowComment>(`${this.COMMENTS_BASE}`, req);
  }

  getDocumentComments(documentId: string) {
    return this.http.get<WorkflowComment[]>(`${this.COMMENTS_BASE}/document/${documentId}`);
  }

  getWorkflowComments(workflowId: string) {
    return this.http.get<WorkflowComment[]>(`${this.COMMENTS_BASE}/workflow/${workflowId}`);
  }

  clearSelected() {
    this.selectedWorkflow.set(null);
  }
}
