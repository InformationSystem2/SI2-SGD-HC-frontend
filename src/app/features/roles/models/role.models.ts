export interface Role {
  id:             string;
  name:           string;
  description:    string;
  isActive:       boolean;
  permissionsIds:       string[];
  attributePermissions: RoleAttributePermission[];
}

export interface RoleAttributePermission {
  entityName:    string;
  attributeName: string;
  accessLevel:   'EDITABLE' | 'READ_ONLY' | 'NO_VISIBLE';
}

export interface CreateRoleRequest {
  name:           string;
  description:    string;
  permissionsIds:       string[];
  attributePermissions: RoleAttributePermission[];
}

export interface UpdateRoleRequest {
  name:           string;
  description:    string;
  isActive:       boolean;
  permissionsIds:       string[];
  attributePermissions: RoleAttributePermission[];
}
