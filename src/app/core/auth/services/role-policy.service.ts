import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export const ROLES = {
  SUPERUSER: 'ROLE_SUPERUSER',
  ADMIN: 'ROLE_ADMIN',
  DIRECTOR: 'ROLE_DIRECTOR',
  ARCHIVO: 'ROLE_ARCHIVO',
  MEDICO: 'ROLE_MEDICO',
};

@Injectable({ providedIn: 'root' })
export class RolePolicyService {
  private auth = inject(AuthService);

  isSuperuser(): boolean {
    return this.auth.roles().includes(ROLES.SUPERUSER);
  }

  isAdminDefault(): boolean {
    const roles = this.auth.roles();
    return roles.includes(ROLES.ADMIN) && !roles.includes(ROLES.SUPERUSER);
  }

  hasAnyRole(rolesToCheck: string[]): boolean {
    const userRoles = this.auth.roles();
    return rolesToCheck.some(r => userRoles.includes(r));
  }

  canManageRole(roleName: string): boolean {
    if (this.isSuperuser()) return true;
    if (this.isAdminDefault() && (roleName === ROLES.SUPERUSER || roleName === ROLES.ADMIN)) {
      return false;
    }
    return true;
  }

  allowedRolesForAdmin(): string[] {
    return [ROLES.DIRECTOR, ROLES.ARCHIVO, ROLES.MEDICO];
  }

  canManageUserWithRoles(userRoleNames: string[]): boolean {
    if (this.isSuperuser()) return true;
    if (this.isAdminDefault()) {
      if (userRoleNames.includes(ROLES.SUPERUSER) || userRoleNames.includes(ROLES.ADMIN)) {
        return false;
      }
    }
    return true;
  }
}
