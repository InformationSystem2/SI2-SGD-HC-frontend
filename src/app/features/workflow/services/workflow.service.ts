import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  AddCommentRequest,
  WorkflowComment,
  WorkflowEvent,
} from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/workflow`;

  getDocumentHistory(documentId: string) {
    return this.http.get<WorkflowEvent[]>(`${this.BASE}/documents/${documentId}/events`);
  }

  getDocumentComments(documentId: string) {
    return this.http.get<WorkflowComment[]>(`${this.BASE}/documents/${documentId}/comments`);
  }

  addComment(documentId: string, req: AddCommentRequest) {
    return this.http.post<WorkflowComment>(`${this.BASE}/documents/${documentId}/comments`, req);
  }
}
