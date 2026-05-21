import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DicomStudy, DicomUploadMultiResult } from '../models/dicom.model';

@Injectable({ providedIn: 'root' })
export class DicomApiService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/dicom`;

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  listStudies() {
    return this.http.get<DicomStudy[]>(`${this.BASE}/studies`);
  }

  getStudyById(studyId: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DicomStudy>(`${this.BASE}/studies/${studyId}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar el estudio DICOM');
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getStudiesByPatient(patientId: string) {
    return this.http.get<DicomStudy[]>(`${this.BASE}/studies/patient/${patientId}`);
  }

  uploadDicom(file: File, patientId: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('patientId', patientId);
    return this.http.post<DicomStudy>(`${this.BASE}/upload`, form);
  }

  /**
   * Sube múltiples archivos .dcm asociándolos directamente a un paciente.
   *
   * Contrato esperado del backend en `POST /dicom/upload-multi`:
   *   - multipart/form-data
   *   - campo `patientId`: string (UUID del paciente)
   *   - campo `files`: File[] (uno o más; usa el mismo nombre repetido)
   *
   * El servidor debe:
   *   1. Crear o reusar un Study DICOM para el paciente por StudyInstanceUID.
   *   2. Por cada archivo, parsear el header DICOM y extraer SOPInstanceUID (0008,0018).
   *   3. Rechazar (no abortar el lote) los SOPInstanceUID ya almacenados.
   *   4. Devolver `DicomUploadMultiResult` con los procesados, omitidos y fallidos.
   */
  uploadDicomMulti(patientId: string, files: File[]) {
    const form = new FormData();
    form.append('patientId', patientId);
    for (const f of files) form.append('files', f, f.name);
    return this.http.post<DicomUploadMultiResult>(`${this.BASE}/upload-multi`, form);
  }

  /**
   * Construye el imageId en formato WADO-URI para que Cornerstone3D lo use.
   * El auth interceptor añade Bearer automáticamente a la request fetch.
   */
  buildWadoUri(instanceId: string): string {
    return `wadouri:${this.BASE}/instances/${instanceId}/file`;
  }
}
