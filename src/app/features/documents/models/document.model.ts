export type DocumentStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'COMPLETED';


// { fieldName: fieldType }  — ej. { "medicamento": "text", "dosis": "number" }
export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  TIME = 'TIME',
  SELECT = 'SELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  FILE = 'FILE',
  DISPLAY_TEXT = 'DISPLAY_TEXT',
  /** Tipo para listas de sub-objetos (ej. receta médica con múltiples ítems) */
  ARRAY = 'ARRAY'
}

export interface FieldConfig {
  type: FieldType;
  required: boolean;
  label: string;
  order: number;
  /** Opciones para SELECT / RADIO */
  options?: Record<string, string>;
  /**
   * Sub-esquema para campos ARRAY.
   * Cada entrada define una columna de la tabla repetible.
   * Ej: { "medicamento": { type: TEXT, ... }, "dosis": { type: TEXT, ... } }
   */
  subSchema?: Record<string, FieldConfig>;
}

export type UiSchema = Record<string, FieldConfig>;

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  uiSchema: UiSchema;
}

export interface Document {
  id: string;
  patientId: string;
  patientName: string;
  uploaderId: string;
  uploaderName: string;
  templateId: string;
  templateName: string;
  status: DocumentStatus;
  clinicalContent: Record<string, unknown>;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  isExternalSource: boolean;
}

export interface UpdateDocumentRequest {
  issueDate: string;
  expiryDate?: string;
  clinicalContent?: Record<string, unknown>;
  status?: DocumentStatus;
}

export interface CreateDocumentRequest {
  patientId: string;
  templateId: string;
  clinicalContent: Record<string, unknown>;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  isExternalSource?: boolean;
}

export interface ExternalDocumentRequest {
  patientId: string;
  fileUrl: string;
  issueDate: string;
  notes?: string;
}
