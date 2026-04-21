
export type DocumentType = 'CI' | 'PASSPORT' | 'OTHER';
export type Gender       = 'male' | 'female';

export interface CreateUserRequest {
  email:          string;
  firstName:      string;
  lastName:       string;
  password:       string;
  rolesIds:       number[];
  // opcionales
  documentType?:  string;
  documentNumber?: string;
  phone?:         string;
  gender?:        string;
}

export interface CreateUserResponse {
  id:             number;
  email:          string;
  firstName:      string;
  lastName:       string;
}


export interface UserRole {
  id:   number;
  name: string;
}

export interface User {
  id:             number;
  email:          string;
  firstName:      string;
  lastName:       string;
  active:         boolean;
  documentType?:  string;
  documentNumber?: string;
  phone?:         string;
  gender?:        string;
  roles:          UserRole[];
}
