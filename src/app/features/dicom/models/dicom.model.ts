

export interface DicomStudy {
  id:           string;
  patientId:    string;
  patientName:  string;
  uploaderId:   string;
  uploaderName: string;
  fileUrl:      string;
  issueDate:    string;
  status:       'DRAFT' | 'PENDING_SIGNATURE' | 'COMPLETED';
  category:     'DICOM_STUDY';
}

export interface UploadDicomRequest {
  file:      File;
  patientId: string;
  issueDate: string; // YYYY-MM-DD
}
