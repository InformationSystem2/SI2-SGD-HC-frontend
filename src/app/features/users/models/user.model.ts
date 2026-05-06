export type DocumentType = 'CI' | 'PASAPORTE';
export type Gender       = 'MALE' | 'FEMALE';

export interface CreateUserRequest {
  documentType?:   string;
  documentNumber?: string;
  email:           string;
  firstName:       string;
  lastName:        string;
  password:        string;
  phone?:          string;
  gender?:         string;
  rolesIds:        string[];
}

export interface UpdateUserRequest {
  documentType?:   string;
  documentNumber?: string;
  firstName:       string;
  lastName:        string;
  password?:       string;
  phone?:          string;
  isActive:        boolean;
  rolesIds:        string[];
}

export interface User {
  id:              string;
  username:        string;
  email:           string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
  documentType?:   string;
  documentNumber?: string;
  gender?:         string;
  isActive:        boolean;
  rolesIds:        string[];
}
