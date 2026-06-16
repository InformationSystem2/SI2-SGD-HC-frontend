import { DocumentStatus } from './document.model';

/** Snapshot inmutable de un documento clínico. Solo lectura. */
export interface DocumentVersion {
  id: string;
  versionNumber: number;
  authorId: string;
  status: DocumentStatus;
  changeReason: string;
  clinicalContent: Record<string, unknown>;
  createdAt: string;
  fileUrl?: string | null;
}

/** Solicitud de transición de estado. */
export interface StateTransitionRequest {
  targetStatus: DocumentStatus;
  changeReason: string;
}

/** Solicitud de edición del contenido clínico. */
export interface EditClinicalContentRequest {
  clinicalContent: Record<string, unknown>;
  changeReason: string;
}
