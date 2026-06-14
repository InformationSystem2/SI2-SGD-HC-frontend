import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../services/roles.service';
import { PermissionsService } from '../../../permissions/services/permissions.service';
import { faFloppyDisk, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import { Permission } from '../../../permissions/models/permission.model';
import { RoleAttributePermission } from '../../models/role.models';

@Component({
  selector: 'app-role-form',
  imports: [FontAwesomeModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './role-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm implements OnInit {

  private fb    = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  readonly rolesService       = inject(RolesService);
  readonly permissionsService = inject(PermissionsService);

  readonly faShieldHalved = faShieldHalved;
  readonly faSpinner      = faSpinner;
  readonly faFloppyDisk   = faFloppyDisk;

  readonly editId = signal<string | null>(null);
  readonly isEdit = signal(false);

  readonly selectedPermissionIds = signal<string[]>([]);

  readonly permissionsByModule = computed(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of this.permissionsService.permissions()) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return groups;
  });

  readonly moduleNames = computed(() => Object.keys(this.permissionsByModule()));

  readonly availableAttributes = [
    { entity: 'Patient', field: 'firstName', label: 'Nombre Paciente' },
    { entity: 'Patient', field: 'lastName', label: 'Apellido Paciente' },
    { entity: 'Patient', field: 'documentType', label: 'Tipo Doc. Paciente' },
    { entity: 'Patient', field: 'documentNumber', label: 'Nro Doc. Paciente' },
    { entity: 'Patient', field: 'birthDate', label: 'Fecha Nac. Paciente' },
    { entity: 'Patient', field: 'gender', label: 'Género Paciente' },
    { entity: 'Patient', field: 'phone', label: 'Teléfono Paciente' },
    { entity: 'Patient', field: 'address', label: 'Dirección Paciente' },
    { entity: 'User', field: 'firstName', label: 'Nombre Usuario' },
    { entity: 'User', field: 'lastName', label: 'Apellido Usuario' },
    { entity: 'User', field: 'email', label: 'Email Usuario' },
    { entity: 'User', field: 'phone', label: 'Teléfono Usuario' },
  ];

  readonly attributePermissions = signal<Record<string, 'EDITABLE'|'READ_ONLY'|'NO_VISIBLE'>>({});

  form = this.fb.group({
    name:        ['', Validators.required],
    description: ['', Validators.required],
    isActive:    [true],
  });

  ngOnInit(): void {
    this.permissionsService.loadPermissions().subscribe();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.isEdit.set(true);

      this.rolesService.getRole(id).subscribe(role => {
        this.form.patchValue({
          name:        role.name,
          description: role.description,
          isActive:    role.isActive,
        });
        this.selectedPermissionIds.set(role.permissionsIds ?? []);
        
        if (role.attributePermissions) {
          const map: Record<string, 'EDITABLE'|'READ_ONLY'|'NO_VISIBLE'> = {};
          for (const attr of role.attributePermissions) {
            map[`${attr.entityName}_${attr.attributeName}`] = attr.accessLevel;
          }
          this.attributePermissions.set(map);
        }
      });
    }
  }

  updateAttributeAccess(entity: string, field: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'EDITABLE'|'READ_ONLY'|'NO_VISIBLE';
    this.attributePermissions.update(current => ({
      ...current,
      [`${entity}_${field}`]: value
    }));
  }

  getAttributeAccess(entity: string, field: string): string {
    return this.attributePermissions()[`${entity}_${field}`] || 'EDITABLE';
  }

  togglePermission(id: string): void {
    this.selectedPermissionIds.update(current =>
      current.includes(id)
        ? current.filter(p => p !== id)
        : [...current, id],
    );
  }

  isPermissionSelected(id: string): boolean {
    return this.selectedPermissionIds().includes(id);
  }

  getPermissionLabel(perm: Permission): string {
    const base = perm.name.replace(`${perm.module}:`, '');
    if (!base.includes(':')) {
      return `${base} (general)`;
    }
    return base;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, isActive } = this.form.value;
    const permissionsIds = this.selectedPermissionIds();
    
    const attrPermsArray: RoleAttributePermission[] = Object.entries(this.attributePermissions()).map(([key, accessLevel]) => {
      const [entityName, attributeName] = key.split('_');
      return { entityName, attributeName, accessLevel };
    });

    if (this.isEdit()) {
      this.rolesService
        .updateRole(this.editId()!, {
          name:        name!,
          description: description!,
          isActive:    isActive!,
          permissionsIds,
          attributePermissions: attrPermsArray,
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    } else {
      this.rolesService
        .createRole({
          name:        name!,
          description: description!,
          permissionsIds,
          attributePermissions: attrPermsArray,
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
