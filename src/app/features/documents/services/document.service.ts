import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateDocumentRequest,
  Document,
  DocumentStatus,
  ExternalDocumentRequest,
  UpdateDocumentRequest,
} from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/documents`;

  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);
  readonly success   = signal(false);
  readonly documents = signal<Document[]>([]);

  getAll() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Document[]>(this.BASE).pipe(
      tap(data => {
        this.documents.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar documentos');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getByPatient(patientId: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Document[]>(`${this.BASE}/patient/${patientId}`).pipe(
      tap(data => {
        this.documents.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar documentos');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getById(id: string) {
    return this.http.get<Document>(`${this.BASE}/${id}`);
  }

  search(key: string, value: string) {
    const params = new HttpParams().set('key', key).set('value', value);
    return this.http.get<Document[]>(`${this.BASE}/search`, { params });
  }

  create(data: CreateDocumentRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.post<Document>(this.BASE, data).pipe(
      tap(doc => {
        this.documents.update(list => [doc, ...list]);
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al crear el documento');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  /** Sube un archivo y devuelve su URL pública. */
  uploadFile(file: File) {
    const form = new FormData();
    form.append('file', file);

    return this.http.post<{ url: string }>(`${this.BASE}/upload-file`, form);
  }

  /** Crea un documento externo (archivo) enlazado a un paciente. */
  createExternal(data: ExternalDocumentRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    return this.http.post<Document>(`${this.BASE}/external`, data).pipe(
      tap(doc => {
        this.documents.update(list => [doc, ...list]);
        this.loading.set(false);
        this.success.set(true);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al guardar el documento');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  changeStatus(id: string, status: DocumentStatus) {
    return this.http.patch<Document>(
      `${this.BASE}/${id}/status`,
      null,
      { params: new HttpParams().set('status', status) },
    );
  }

  update(id: string, data: UpdateDocumentRequest) {
    return this.http.put<Document>(`${this.BASE}/${id}`, data).pipe(
      tap(updated => {
        this.documents.update(list => list.map(d => d.id === id ? updated : d));
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al actualizar el documento');
        return EMPTY;
      }),
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this.documents.update(list => list.filter(d => d.id !== id));
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al eliminar el documento');
        return EMPTY;
      }),
    );
  }

  createOnlyofficeSession(req: { patientId: string; issueDate: string; title?: string; fileUrl?: string; docType?: 'WORD' | 'CELL' | 'SLIDE' | 'PDF' }) {
    return this.http.post<OoSession>(`${this.BASE}/onlyoffice/session`, req);
  }

  openOnlyofficeSession(docId: string) {
    return this.http.post<OoSession>(`${this.BASE}/onlyoffice/${docId}/session`, {});
  }

  openOnlyofficeViewSession(docId: string) {
    return this.http.post<OoSession>(`${this.BASE}/onlyoffice/${docId}/view-session`, {});
  }

  openOnlyofficeVersionViewSession(docId: string, versionId: string) {
    return this.http.post<OoSession>(`${this.BASE}/${docId}/versions/${versionId}/onlyoffice-view-session`, {});
  }
}

interface OoSession {
  documentId: string; docKey: string; documentServerUrl: string;
  emptyDocUrl: string; callbackUrl: string; configToken: string;
  fileType: string; ooDocumentType: string;
}
