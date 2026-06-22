import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TaskDelegation, CreateDelegationRequest } from '../models/delegation.model';

@Injectable({ providedIn: 'root' })
export class DelegationService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/delegations`;

  readonly delegations = signal<TaskDelegation[]>([]);
  readonly loading = signal(false);

  getActiveDelegations() {
    this.loading.set(true);
    return this.http.get<TaskDelegation[]>(this.BASE).pipe(
      tap(d => { this.delegations.set(d); this.loading.set(false); }),
      catchError(err => {
        console.error('Error loading delegations:', err);
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  createDelegation(req: CreateDelegationRequest) {
    return this.http.post<TaskDelegation>(this.BASE, req);
  }

  cancelDelegation(id: string) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
