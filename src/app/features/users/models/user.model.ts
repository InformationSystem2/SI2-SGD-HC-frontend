export type DocumentType = 'CI' | 'PASSPORT' | 'OTHER';
export type Gender       = 'male' | 'female';

export interface CreateUserRequest {
  email:           string;
  firstName:       string;
  lastName:        string;
  password:        string;
  rolesIds:        number[];
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  gender?:         string;
}

export interface UpdateUserRequest {
  firstName:       string;
  lastName:        string;
  isActive:        boolean;
  rolesIds:        number[];
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  password?:       string;
}

export interface CreateUserResponse {
  id:        number;
  email:     string;
  firstName: string;
  lastName:  string;
}

export interface User {
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
  rolesIds:        number[];
}
