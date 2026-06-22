// src/app/features/historial/pages/historial-list/historial-list.ts

/**
 * Componente principal para la búsqueda de historiales clínicos.
 * Incluye:
 * - Formulario reactivo con filtros (nombre, CI, estado, rango de fechas)
 * - Tabla de resultados paginada
 * - Paginación server-side (usa los metadatos devueltos por el backend)
 * - Manejo de estados de carga, error y sin resultados
 * - Reutilización de estilos y estructura similar a patient-list y document-list
 */

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faSpinner, faFileAlt, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { HistorialService } from '../../services/historial.service';
import { DocumentResponse, HistorialSearchParams } from '../../models/historial.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-historial-list',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FontAwesomeModule,
        DatePipe,
        TranslatePipe,   // ← Agrega esta línea (no olvides la coma después de DatePipe)
    ],
    templateUrl: './historial-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialList implements OnInit {
    readonly historialService = inject(HistorialService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    // Iconos de FontAwesome para la UI
    readonly faSearch = faSearch;
    readonly faSpinner = faSpinner;
    readonly faFileAlt = faFileAlt;
    readonly faEye = faEye;
    readonly faEdit = faEdit;

    // Formulario reactivo con los filtros de búsqueda
    searchForm = this.fb.group({
        nombre: [''],        // Nombre parcial del paciente
        nroDoc: [''],        // Número de documento exacto
        estado: [''],        // Estado: '', 'DRAFT', 'PENDING_REVIEW', 'REJECTED', 'FINALIZED'
        fechaDesde: [''],    // Fecha mínima en formato YYYY-MM-DD
        fechaHasta: [''],    // Fecha máxima
    });

    // Señales para paginación (estado local del componente)
    readonly page = signal(0);         // Página actual (0-indexed)
    readonly size = signal(10);        // Tamaño de página (por defecto 10)
    readonly totalPages = signal(0);   // Total de páginas devuelto por el backend
    readonly totalElements = signal(0); // Total de elementos sin paginar

    ngOnInit(): void {
        this.buscar(); // Cargar primera página al iniciar
    }

    /**
     * Ejecuta la búsqueda con los filtros actuales y la página/tamaño actuales.
     * Actualiza las señales de paginación con los metadatos de la respuesta.
     */
    buscar(): void {
        const rawValue = this.searchForm.value;

        // Construir params limpiando null/undefined y validando tipos
        const params: HistorialSearchParams = {
            page: this.page(),
            size: this.size(),
        };

        // Solo agregar si el valor es truthy (no null, no undefined, no string vacío)
        if (rawValue.nombre) params.nombre = rawValue.nombre;
        if (rawValue.nroDoc) params.nroDoc = rawValue.nroDoc;
        if (rawValue.fechaDesde) params.fechaDesde = rawValue.fechaDesde;
        if (rawValue.fechaHasta) params.fechaHasta = rawValue.fechaHasta;

        // Para estado, solo permitir valores válidos
        const estadoRaw = rawValue.estado;
        if (estadoRaw === 'DRAFT' || estadoRaw === 'PENDING_REVIEW' || estadoRaw === 'REJECTED' || estadoRaw === 'FINALIZED') {
            params.estado = estadoRaw;
        }

        this.historialService.search(params).subscribe(() => {
            const result = this.historialService.result();
            if (result) {
                this.totalPages.set(result.totalPages);
                this.totalElements.set(result.totalElements);
            }
        });
    }

    /** Cambia a una página específica y vuelve a buscar */
    onPageChange(newPage: number): void {
        this.page.set(newPage);
        this.buscar();
    }

    /** Página anterior (si no es la primera) */
    prevPage(): void {
        if (this.page() > 0) this.onPageChange(this.page() - 1);
    }

    /** Página siguiente (si no es la última) */
    nextPage(): void {
        if (this.page() + 1 < this.totalPages()) this.onPageChange(this.page() + 1);
    }

    /** Navega a la vista de detalle del documento (ruta existente en el módulo de documentos) */
    viewDocument(id: string): void {
        this.router.navigate(['/documents/view', id]);
    }

    /** Navega a la edición del documento (ruta existente) */
    editDocument(id: string): void {
        this.router.navigate(['/documents/edit', id]);
    }

    /** Devuelve las clases CSS para el badge de estado, según el estado del documento */
    statusClass(status: string): string {
        const classes: Record<string, string> = {
            DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            PENDING_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            FINALIZED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
        return classes[status] ?? 'bg-gray-100 text-gray-700';
    }

    /** Devuelve la etiqueta traducible (o en español) para el estado */
    statusLabel(status: string): string {
        const labels: Record<string, string> = {
            DRAFT: 'HISTORIAL.STATUS_DRAFT',
            PENDING_REVIEW: 'HISTORIAL.STATUS_PENDING_REVIEW',
            REJECTED: 'HISTORIAL.STATUS_REJECTED',
            FINALIZED: 'HISTORIAL.STATUS_FINALIZED',
        };
        return labels[status] ?? status;
    }

    /** Limpia todos los filtros del formulario y vuelve a la primera página */
    clearFilters(): void {
        this.searchForm.reset();
        this.page.set(0);
        this.buscar();
    }
}