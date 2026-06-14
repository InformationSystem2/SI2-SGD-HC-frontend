import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPencil,
  faTrash,
  faSpinner,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { RolesService } from '../../services/roles.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RolePolicyService, ROLES } from '../../../../core/auth/services/role-policy.service';

@Component({
  selector: 'app-role-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './role-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleList implements OnInit{

  readonly rolesService = inject(RolesService);
  readonly rolePolicyService = inject(RolePolicyService);
  private router = inject(Router);
  private translate = inject(TranslateService);  

  readonly faPlus          = faPlus;
  readonly faPencil        = faPencil;
  readonly faTrash         = faTrash;
  readonly faSpinner       = faSpinner;
  readonly faShieldHalved  = faShieldHalved;

  readonly visibleRoles = computed(() => {
    const roles = this.rolesService.roles();
    if (this.rolePolicyService.isSuperuser()) return roles;
    return roles.filter(r => r.name !== ROLES.SUPERUSER && r.name !== ROLES.ADMIN);
  });

  canManageRole(roleName: string): boolean {
    return this.rolePolicyService.canManageRole(roleName);
  }

  ngOnInit(): void {
    this.rolesService.loadRoles().subscribe();
  }

  goToCreate(): void {
    this.router.navigate(['/roles/form']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/roles/form', id]);
  }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.rolesService.deleteRole(id).subscribe();
  }

}
