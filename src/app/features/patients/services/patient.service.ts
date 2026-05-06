import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePatientRequest, Patient, UpdatePatientRequest } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/module_users/patients`;

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal(false);
  readonly patients = signal<Patient[]>([]);

  getPatients() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Patient[]>(this.BASE).pipe(
      tap(data => {
        this.patients.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar pacientes');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getPatient(id: string) {
    return this.http.get<Patient>(`${this.BASE}/${id}`);
  }

  createPatient(data: CreatePatientRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.post<Patient>(this.BASE, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear el paciente');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  updatePatient(id: string, data: UpdatePatientRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.put<Patient>(`${this.BASE}/${id}`, data).pipe(
      tap(updated => {
        this.patients.update(list => list.map(p => (p.id === id ? updated : p)));
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar el paciente');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  deletePatient(id: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this.patients.update(list => list.filter(p => p.id !== id));
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al eliminar el paciente');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
