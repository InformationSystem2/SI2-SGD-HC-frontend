import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClinicalHistory, ClinicalHistoryUpdateDto } from '../models/clinical-history.model';

@Injectable({ providedIn: 'root' })
export class ClinicalHistoryService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/module_users/clinical-histories`;

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal(false);

  getByPatientId(patientId: string) {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<ClinicalHistory>(`${this.BASE}/patient/${patientId}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al obtener la historia clínica');
        this.loading.set(false);
        throw err;
      })
    );
  }

  create(data: ClinicalHistory) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    return this.http.post<ClinicalHistory>(this.BASE, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear la historia clínica');
        this.loading.set(false);
        throw err;
      })
    );
  }

  update(id: string, data: ClinicalHistoryUpdateDto) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    return this.http.put<ClinicalHistory>(`${this.BASE}/${id}`, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar la historia clínica');
        this.loading.set(false);
        throw err;
      })
    );
  }
}
