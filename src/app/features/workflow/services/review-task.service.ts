import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CompleteTaskRequest,
  ReviewTask,
  StartReviewRequest,
  WorkflowStats,
} from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class ReviewTaskService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/review-tasks`;

  readonly myTasks = signal<ReviewTask[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  getMyTasks() {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<ReviewTask[]>(`${this.BASE}/my-tasks`).pipe(
      tap(tasks => { this.myTasks.set(tasks); this.loading.set(false); }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar tareas');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getByDocument(documentId: string) {
    return this.http.get<ReviewTask[]>(`${this.BASE}/document/${documentId}`);
  }

  startReview(req: StartReviewRequest) {
    return this.http.post<ReviewTask[]>(`${this.BASE}/start`, req);
  }

  claimTask(taskId: string) {
    return this.http.post<ReviewTask>(`${this.BASE}/${taskId}/claim`, null);
  }

  completeTask(taskId: string, req: CompleteTaskRequest) {
    return this.http.post<ReviewTask>(`${this.BASE}/${taskId}/complete`, req);
  }

  getStats() {
    return this.http.get<WorkflowStats>(`${this.BASE}/stats`);
  }
}
