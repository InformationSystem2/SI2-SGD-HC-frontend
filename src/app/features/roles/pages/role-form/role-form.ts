import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../services/roles.service';
import { PermissionsService } from '../../../permissions/services/permissions.service';
import { faFloppyDisk, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import { Permission } from '../../../permissions/models/permission.model';
import { AuthService } from '../../../../core/auth/services/auth.service';

export interface AttributePermission {
  name: string;
  read: Permission | null;
  create: Permission | null;
  update: Permission | null;
}

export interface StructuredPermissionGroup {
  module: string;
  general: {
    read: Permission | null;
    create: Permission | null;
    update: Permission | null;
    delete: Permission | null;
  };
  attributes: AttributePermission[];
}


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
  readonly auth               = inject(AuthService);

  readonly faShieldHalved = faShieldHalved;
  readonly faSpinner      = faSpinner;
  readonly faFloppyDisk   = faFloppyDisk;

  readonly editId = signal<string | null>(null);
  readonly isEdit = signal(false);

  readonly selectedPermissionIds = signal<string[]>([]);

  readonly structuredPermissions = computed<StructuredPermissionGroup[]>(() => {
    const permissions = this.permissionsService.permissions();
    const groupsMap: Record<string, StructuredPermissionGroup> = {};

    for (const p of permissions) {
      const mod = p.module;
      if (!groupsMap[mod]) {
        groupsMap[mod] = {
          module: mod,
          general: { read: null, create: null, update: null, delete: null },
          attributes: []
        };
      }

      const group = groupsMap[mod];
      const nameParts = p.name.split(':');
      
      if (nameParts.length === 2) {
        const action = nameParts[1];
        if (action === 'read') group.general.read = p;
        else if (action === 'create') group.general.create = p;
        else if (action === 'update') group.general.update = p;
        else if (action === 'delete') group.general.delete = p;
      } else if (nameParts.length >= 3) {
        const action = nameParts[1];
        const attributeName = nameParts.slice(2).join(':');
        
        let attr = group.attributes.find(a => a.name === attributeName);
        if (!attr) {
          attr = { name: attributeName, read: null, create: null, update: null };
          group.attributes.push(attr);
        }
        
        if (action === 'read') attr.read = p;
        else if (action === 'create') attr.create = p;
        else if (action === 'update') attr.update = p;
      }
    }

    const sortedGroups = Object.values(groupsMap).sort((a, b) => a.module.localeCompare(b.module));
    for (const g of sortedGroups) {
      g.attributes.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sortedGroups;
  });



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

        if (!this.auth.hasPermission('role:update:name')) {
          this.form.get('name')?.disable();
          this.form.get('name')?.clearValidators();
          this.form.get('name')?.updateValueAndValidity();
        }
        if (!this.auth.hasPermission('role:update:description')) {
          this.form.get('description')?.disable();
          this.form.get('description')?.clearValidators();
          this.form.get('description')?.updateValueAndValidity();
        }
        if (!this.auth.hasPermission('role:update:is_active')) {
          this.form.get('isActive')?.disable();
        }
      });
    }
  }



  togglePermission(id: string): void {
    const allowed = this.isEdit()
      ? this.auth.hasPermission('role:update:permissions')
      : this.auth.hasPermission('role:create:permissions');
    if (!allowed) return;

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

    const v = this.form.getRawValue();
    const permissionsIds = this.selectedPermissionIds();
    
    if (this.isEdit()) {
      const payload = {
        name:        this.auth.hasPermission('role:update:name') ? (v.name || '') : (v.name || ''),
        description: this.auth.hasPermission('role:update:description') ? (v.description || '') : (v.description || ''),
        isActive:    this.auth.hasPermission('role:update:is_active') ? !!v.isActive : !!v.isActive,
        permissionsIds: this.auth.hasPermission('role:update:permissions') ? permissionsIds : permissionsIds,
      };
      this.rolesService.updateRole(this.editId()!, payload)
        .subscribe(() => this.router.navigate(['/roles/list']));
    } else {
      const payload = {
        name:        v.name || '',
        description: v.description || '',
        permissionsIds: permissionsIds,
      };
      this.rolesService.createRole(payload)
        .subscribe(() => this.router.navigate(['/roles/list']));
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
