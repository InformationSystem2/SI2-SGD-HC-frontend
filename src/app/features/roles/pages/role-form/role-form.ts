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

  readonly permissionsByModule = computed(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of this.permissionsService.permissions()) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return groups;
  });

  readonly moduleNames = computed(() => Object.keys(this.permissionsByModule()));

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
    } else {
      if (!this.auth.hasPermission('role:create:name')) {
        this.form.get('name')?.disable();
        this.form.get('name')?.clearValidators();
        this.form.get('name')?.updateValueAndValidity();
      }
      if (!this.auth.hasPermission('role:create:description')) {
        this.form.get('description')?.disable();
        this.form.get('description')?.clearValidators();
        this.form.get('description')?.updateValueAndValidity();
      }
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
        name:        this.auth.hasPermission('role:create:name') ? (v.name || '') : (v.name || ''),
        description: this.auth.hasPermission('role:create:description') ? (v.description || '') : (v.description || ''),
        permissionsIds: this.auth.hasPermission('role:create:permissions') ? permissionsIds : permissionsIds,
      };
      this.rolesService.createRole(payload)
        .subscribe(() => this.router.navigate(['/roles/list']));
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
