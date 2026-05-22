// src/app/features/historial/models/historial.model.ts

/**
 * Modelos de datos para el módulo de búsqueda de historiales clínicos.
 * Define la estructura de los documentos que devuelve el backend y los parámetros de búsqueda.
 */

/** Representa un documento clínico (historial) devuelto por el backend */
export interface DocumentResponse {
  id: string;                    // UUID del documento
  patientId: string;             // UUID del paciente
  patientName: string;           // Nombre completo del paciente
  uploaderId: string;            // UUID del usuario que subió/cargó el documento
  uploaderName: string;          // Nombre del usuario
  templateId: string | null;     // UUID de la plantilla (si tiene)
  templateName: string;          // Nombre de la plantilla o "Documento Externo"
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'COMPLETED';   // Estado del documento
  clinicalContent: any;          // Contenido clínico en JSONB (datos variables según plantilla)
  issueDate: string;             // Fecha de emisión (ISO date)
  expiryDate: string | null;     // Fecha de caducidad (si aplica)
  fileUrl: string;               // Ruta del archivo físico (PDF)
  isExternalSource: boolean;     // Si es documento externo subido (vs generado desde plantilla)
  patientDocumentNumber?: string;   // ← Nueva línea
}

/** Estructura de página que devuelve el backend para respuestas paginadas */
export interface Page<T> {
  content: T[];          // Lista de elementos de la página actual
  totalElements: number; // Total de elementos en toda la BD (sin paginar)
  totalPages: number;    // Número total de páginas
  size: number;          // Tamaño de página solicitado
  number: number;        // Número de página actual (0-indexed)
  first: boolean;        // Si es la primera página
  last: boolean;         // Si es la última página
  empty: boolean;        // Si no hay contenido
}

/** Parámetros que se envían al endpoint GET /api/historiales/search */
export interface HistorialSearchParams {
  nombre?: string;               // Búsqueda parcial por nombre del paciente
  nroDoc?: string;               // Número de documento exacto
  estado?: 'DRAFT' | 'PENDING_SIGNATURE' | 'COMPLETED'; // Estado del documento
  fechaDesde?: string;           // Fecha mínima (YYYY-MM-DD)
  fechaHasta?: string;           // Fecha máxima (YYYY-MM-DD)
  page: number;                  // Número de página (0-indexed)
  size: number;                  // Tamaño de página
}