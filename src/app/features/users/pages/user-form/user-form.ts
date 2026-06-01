import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { UpdateUserRequest } from '../../models/user.model';
import { TranslatePipe } from '@ngx-translate/core';
import { RolePolicyService } from '../../../../core/auth/services/role-policy.service';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './user-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  readonly userService  = inject(UserService);
  readonly rolesService = inject(RolesService);
  readonly rolePolicyService = inject(RolePolicyService);

  readonly faUsers       = faUsers;
  readonly faSpinner     = faSpinner;
  readonly faFloppyDisk  = faFloppyDisk;

  readonly editId = signal<string | null>(null);

  readonly documentTypes = ['CI', 'PASAPORTE'];
  readonly genders = [
    { value: 'MALE',   label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino'  },
  ];

  readonly availableRoles = computed(() => {
    const roles = this.rolesService.roles();
    if (this.rolePolicyService.isSuperuser()) return roles;
    if (this.rolePolicyService.isAdminDefault()) {
      const allowedNames = this.rolePolicyService.allowedRolesForAdmin();
      return roles.filter(r => allowedNames.includes(r.name));
    }
    return roles;
  });

  readonly canActivateUser = computed(() => {
    if (this.rolePolicyService.isSuperuser()) return true;
    const selectedIds = this.form.value.rolesIds ?? [];
    const selectedRoleNames = selectedIds.map(id => {
      const role = this.rolesService.roles().find(r => r.id === id);
      return role?.name ?? '';
    });
    return this.rolePolicyService.canManageUserWithRoles(selectedRoleNames);
  });

  form = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    documentType:   ['', Validators.required],
    documentNumber: ['', Validators.required],
    phone:          [''],
    gender:         ['', Validators.required],
    isActive:       [true],
    rolesIds:       [[] as string[], Validators.required],
  });

  ngOnInit(): void {
    this.rolesService.loadRoles().subscribe();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);

      this.userService.getUser(id).subscribe(user => {
        this.form.patchValue({
          firstName:      user.firstName,
          lastName:       user.lastName,
          documentType:   user.documentType   ?? '',
          documentNumber: user.documentNumber ?? '',
          phone:          user.phone          ?? '',
          gender:         user.gender         ?? '',
          isActive:       user.isActive,
          rolesIds:       user.rolesIds       ?? [],
        });
      });
    }
  }

  toggleRole(id: string): void {
    const current = this.form.value.rolesIds ?? [];
    const updated = current.includes(id)
      ? current.filter(r => r !== id)
      : [...current, id];
    this.form.patchValue({ rolesIds: updated });
  }

  isRoleSelected(id: string): boolean {
    return (this.form.value.rolesIds ?? []).includes(id);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, documentType, documentNumber, phone, isActive, rolesIds } = this.form.value;

    const payload: UpdateUserRequest = {
      firstName:  firstName!,
      lastName:   lastName!,
      isActive:   isActive!,
      rolesIds:   rolesIds!,
      ...(documentType   ? { documentType }   : {}),
      ...(documentNumber ? { documentNumber } : {}),
      ...(phone          ? { phone }          : {}),
    };

    this.userService.updateUser(this.editId()!, payload).subscribe(() => {
      this.router.navigate(['/usuarios/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/usuarios/list']);
  }
}
