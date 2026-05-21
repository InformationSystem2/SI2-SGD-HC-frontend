import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentTemplate, UiSchema } from '../models/document.model';

export interface CreateTemplateRequest {
  name:        string;
  description: string;
  uiSchema:    UiSchema;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {}

@Injectable({ providedIn: 'root' })
export class DocumentTemplateService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/documents/templates`;

  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);
  readonly success   = signal(false);
  readonly templates = signal<DocumentTemplate[]>([]);

  getAll() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DocumentTemplate[]>(this.BASE).pipe(
      tap(data => {
        this.templates.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar plantillas');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getById(id: string) {
    return this.http.get<DocumentTemplate>(`${this.BASE}/${id}`);
  }

  create(data: CreateTemplateRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.post<DocumentTemplate>(this.BASE, data).pipe(
      tap(created => {
        this.templates.update(list => [...list, created]);
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear la plantilla');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  update(id: string, data: UpdateTemplateRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.put<DocumentTemplate>(`${this.BASE}/${id}`, data).pipe(
      tap(updated => {
        this.templates.update(list => list.map(t => t.id === id ? updated : t));
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar la plantilla');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  delete(id: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this.templates.update(list => list.filter(t => t.id !== id));
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al eliminar la plantilla');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
