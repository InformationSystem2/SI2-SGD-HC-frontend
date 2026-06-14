export type DocumentType = 'CI' | 'PASAPORTE';
export type Gender       = 'MALE' | 'FEMALE';

export interface CreateUserRequest {
  documentType?:   string;
  documentNumber?: string;
  email:           string;
  firstName:       string;
  lastName:        string;
  password:        string;
  phone?:          string | null;
  gender?:         string | null;
  rolesIds?:       string[] | null;
}

export interface UpdateUserRequest {
  documentType?:   string | null;
  documentNumber?: string | null;
  firstName?:      string | null;
  lastName?:       string | null;
  password?:       string | null;
  phone?:          string | null;
  gender?:         string | null;
  isActive?:       boolean | null;
  rolesIds?:       string[] | null;
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
