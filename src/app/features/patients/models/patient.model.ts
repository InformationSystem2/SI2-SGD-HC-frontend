export interface Patient {
  id:              number;
  username:        string;
  email:           string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
  documentType?:   string;
  documentNumber?: string;
  gender?:         string;
  isActive:        boolean;
  birthDate?:      string;
}

export interface CreatePatientRequest {
  email:           string;
  firstName:       string;
  lastName:        string;
  password:        string;
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  gender?:         string;
  birthDate?:      string;
}

export interface UpdatePatientRequest {
  firstName:       string;
  lastName:        string;
  isActive:        boolean;
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  gender?:         string;
  password?:       string;
  birthDate?:      string;
}
