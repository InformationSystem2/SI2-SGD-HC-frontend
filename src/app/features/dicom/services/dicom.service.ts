import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DicomStudy, UploadDicomRequest } from '../models/dicom.model';

@Injectable({ providedIn: 'root' })
export class DicomService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/dicom`;

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly studies = signal<DicomStudy[]>([]);

  /** GET /api/dicom/patient/{patientId} */
  listByPatient(patientId: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DicomStudy[]>(`${this.BASE}/patient/${patientId}`).pipe(
      tap(data => {
        this.studies.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar estudios DICOM');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  /** GET /api/dicom/{id} */
  getById(id: string) {
    return this.http.get<DicomStudy>(`${this.BASE}/${id}`);
  }

  /** POST /api/dicom/upload  (multipart/form-data) */
  upload(req: UploadDicomRequest) {
    this.loading.set(true);
    this.error.set(null);

    const form = new FormData();
    form.append('file',      req.file);
    form.append('patientId', req.patientId);
    form.append('issueDate', req.issueDate);

    return this.http.post<DicomStudy>(`${this.BASE}/upload`, form).pipe(
      tap(study => {
        this.studies.update(list => [study, ...list]);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al subir el estudio DICOM');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  /**
   * Devuelve la URL completa del stream para usar con Cornerstone.js.
   * El header Authorization lo agrega el interceptor de Angular
   * cuando se usa HttpClient, pero para Cornerstone (XHR directo)
   * se necesita esta URL + el token por separado (ver Lección 4).
   */
  getStreamUrl(studyId: string): string {
    return `${this.BASE}/${studyId}/stream`;
  }
}
