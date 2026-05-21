export type Modality = 'CR' | 'CT' | 'MR' | 'US' | 'PT' | 'XA' | 'DX' | 'NM' | 'MG' | 'OT';

export interface DicomInstance {
  id: string;
  sopInstanceUid: string;
  instanceNumber: number | null;
  rows: number | null;
  columns: number | null;
  bitsAllocated: number | null;
  windowCenter: number | null;
  windowWidth: number | null;
  pixelSpacing: number[] | null;
}

export interface DicomSeries {
  id: string;
  seriesInstanceUid: string;
  modality: Modality;
  seriesNumber: number | null;
  seriesDescription: string | null;
  bodyPart: string | null;
  instances: DicomInstance[];
}

export interface DicomStudy {
  id: string;
  patientId: string;
  uploaderId: string;
  studyInstanceUid: string;
  studyDate: string | null;
  studyDescription: string | null;
  accessionNumber: string | null;
  series: DicomSeries[];
}

export interface DicomUploadResponse extends DicomStudy { }

export interface DicomUploadMultiItem {
  filename: string;
  sopInstanceUid?: string;
  reason?: string; // p. ej. 'duplicate', 'invalid-dicom', 'unsupported-syntax'
}

export interface DicomUploadMultiResult {
  study: DicomStudy | null;          // estado final del estudio (puede ser null si todo se omitió)
  uploaded: DicomUploadMultiItem[];  // instancias persistidas en esta llamada
  skipped: DicomUploadMultiItem[];   // omitidas por duplicado u otra razón no-error
  errors: DicomUploadMultiItem[];    // archivos que fallaron al procesarse
}

export type ToolName = 'WindowLevel' | 'Zoom' | 'Pan' | 'Length' | 'Magnify';
