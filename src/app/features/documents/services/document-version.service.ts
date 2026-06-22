import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentVersion } from '../models/document-version.model';

@Injectable({ providedIn: 'root' })
export class DocumentVersionService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/documents`;

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly history  = signal<DocumentVersion[]>([]);

  /** Carga el historial de versiones del documento en el signal history. */
  loadHistory(documentId: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DocumentVersion[]>(
      `${this.BASE}/${documentId}/versions`,
    ).pipe(
      tap(data => {
        this.history.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar el historial');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }
}
