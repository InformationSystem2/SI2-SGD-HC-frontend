// src/app/features/historial/services/historial.service.ts

/**
 * Servicio para comunicarse con el endpoint de búsqueda de historiales clínicos.
 * Utiliza HttpClient para hacer peticiones GET con parámetros y maneja estados de carga/error.
 * El interceptor auth.interceptor.ts ya añade automáticamente el token JWT y el X-Tenant-ID.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, HistorialSearchParams, DocumentResponse } from '../models/historial.model';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private http = inject(HttpClient);
  // URL base del endpoint (definida en environments)
  private readonly BASE = `${environment.apiUrl}/records/search`;

  // Señales para manejar estado de la UI
  readonly loading = signal(false);      // Indica si hay una petición en curso
  readonly error = signal<string | null>(null); // Mensaje de error si ocurre
  readonly result = signal<Page<DocumentResponse> | null>(null); // Último resultado exitoso

  /**
   * Realiza la búsqueda con los parámetros dados.
   * @param params - Filtros y paginación (page, size, nombre, nroDoc, estado, fechas)
   * @returns Observable con la página de resultados
   */
  search(params: HistorialSearchParams) {
    this.loading.set(true);
    this.error.set(null);

    // Construir los parámetros de consulta HTTP
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.nombre) httpParams = httpParams.set('nombre', params.nombre);
    if (params.nroDoc) httpParams = httpParams.set('nroDoc', params.nroDoc);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);

    // Petición GET y manejo de respuesta/error
    return this.http.get<Page<DocumentResponse>>(this.BASE, { params: httpParams }).pipe(
      tap(data => {
        this.result.set(data);   // Guardar resultado en señal
        this.loading.set(false);
      }),
      catchError(err => {
        // Extraer mensaje de error del backend o usar mensaje por defecto
        this.error.set(err.error?.message ?? 'Error al buscar historiales');
        this.loading.set(false);
        return EMPTY; // No propagar el error para que la aplicación no se rompa
      })
    );
  }
}