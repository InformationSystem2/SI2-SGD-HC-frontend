import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../services/roles.service';
import { PermissionsService } from '../../../permissions/services/permissions.service';
import { faFloppyDisk, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import { Permission } from '../../../permissions/models/permission.model';

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

  readonly editId = signal<number | null>(null);
  readonly isEdit = signal(false);

  readonly selectedPermissionIds = signal<number[]>([]);

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
    active:      [true],
  });

  ngOnInit(): void {
    this.permissionsService.loadPermissions().subscribe();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = Number(id);
      this.editId.set(numId);
      this.isEdit.set(true);

      this.rolesService.getRole(numId).subscribe(role => {
        this.form.patchValue({
          name:        role.name,
          description: role.description,
          active:      role.active,
        });
        this.selectedPermissionIds.set(role.permissionsIds ?? []);
      });
    }
  }

  togglePermission(id: number): void {
    this.selectedPermissionIds.update(current =>
      current.includes(id)
        ? current.filter(p => p !== id)
        : [...current, id],
    );
  }

  isPermissionSelected(id: number): boolean {
    return this.selectedPermissionIds().includes(id);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, active } = this.form.value;
    const permissionsIds = this.selectedPermissionIds();

    if (this.isEdit()) {
      this.rolesService
        .updateRole(this.editId()!, {
          name:        name!,
          description: description!,
          active:      active!,
          permissionsIds,
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    } else {
      this.rolesService
        .createRole({
          name:        name!,
          description: description!,
          permissionsIds,
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
