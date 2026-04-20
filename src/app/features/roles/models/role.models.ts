export interface Role {
  id:             number;
  name:           string;
  description:    string;
  active:         boolean;
  permissionsIds: number[];
}

export interface CreateRoleRequest {
  name:           string;
  description:    string;
  permissionsIds: number[];
}

export interface UpdateRoleRequest {
  name:           string;
  description:    string;
  active:         boolean;
  permissionsIds: number[];
}
