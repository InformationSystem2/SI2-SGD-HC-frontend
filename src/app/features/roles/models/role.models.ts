export interface Role {
  id:             string;
  name:           string;
  description:    string;
  isActive:       boolean;
  permissionsIds:       string[];
}

export interface CreateRoleRequest {
  name:           string;
  description:    string;
  permissionsIds:       string[];
}

export interface UpdateRoleRequest {
  name:           string;
  description:    string;
  isActive:       boolean;
  permissionsIds:       string[];
}
