import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BackupService {

  private http = inject(HttpClient);
  
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  generateFullBackup() {
    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    return this.http.get(`${environment.apiUrl}/backups/generate/full`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        this.loading.set(false);
        this.downloadBlob(response.body, this.getFilenameFromHeaders(response.headers) || 'backup_completo.dump');
        this.successMessage.set('Backup generado y descargado con éxito.');
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set('Error al generar el backup completo.');
        return EMPTY;
      })
    );
  }

  generateTenantBackup(slug: string) {
    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    return this.http.get(`${environment.apiUrl}/backups/generate/tenant/${slug}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        this.loading.set(false);
        this.downloadBlob(response.body, this.getFilenameFromHeaders(response.headers) || `backup_tenant_${slug}.sql`);
        this.successMessage.set('Backup de tenant generado y descargado con éxito.');
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set('Error al generar el backup del tenant.');
        return EMPTY;
      })
    );
  }

  restoreFullBackup(file: File) {
    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{message: string}>(`${environment.apiUrl}/backups/restore/full`, formData).pipe(
      tap((res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al restaurar la base de datos completa.');
        return EMPTY;
      })
    );
  }

  restoreTenantBackup(file: File) {
    this.loading.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{message: string}>(`${environment.apiUrl}/backups/restore/tenant`, formData).pipe(
      tap((res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al restaurar el tenant.');
        return EMPTY;
      })
    );
  }

  private getFilenameFromHeaders(headers: HttpHeaders): string | null {
    const disposition = headers.get('content-disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        return matches[1].replace(/['"]/g, '');
      }
    }
    return null;
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
