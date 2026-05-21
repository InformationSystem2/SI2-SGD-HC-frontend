import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OcrResult {
  raw_text:         string;
  structured_data:  Record<string, any>;
  confidence_score: number;
  pages_processed:  number;
  file_type:        string;
}

@Injectable({ providedIn: 'root' })
export class OcrService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/documents`;

  /** Dispara el procesamiento OCR para un documento. */
  triggerOcr(documentId: string): Observable<OcrResult> {
    return this.http.post<OcrResult>(`${this.base}/${documentId}/ocr`, {});
  }

  /** Obtiene el resultado OCR ya guardado. Lanza 404 si no existe. */
  getOcr(documentId: string): Observable<OcrResult> {
    return this.http.get<OcrResult>(`${this.base}/${documentId}/ocr`);
  }
}