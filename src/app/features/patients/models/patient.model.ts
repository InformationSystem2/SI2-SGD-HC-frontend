export type Gender       = 'MALE' | 'FEMALE';
export type DocumentType = 'CI' | 'PASAPORTE';

export interface Patient {
  id:              string;
  documentType?:   string;
  documentNumber?: string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
  address?:        string;
  gender?:         string;
  birthDate?:      string;
}

export interface CreatePatientRequest {
  documentType?:   string;
  documentNumber?: string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
  address?:        string;
  gender?:         string;
  birthDate?:      string;
}

export interface UpdatePatientRequest {
  firstName:       string;
  lastName:        string;
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  address?:        string;
  gender?:         string;
  birthDate?:      string;
}
