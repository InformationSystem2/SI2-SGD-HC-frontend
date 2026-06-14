import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const errors: ValidationErrors = {};
  if (value.length < 8)          errors['minlength']  = true;
  if (!/[A-Z]/.test(value))      errors['uppercase']  = true;
  if (!/[0-9]/.test(value))      errors['number']     = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserService } from '../../services/user.service';
import { faSpinner, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { CreateUserRequest } from '../../models/user.model';
import { RolesService } from '../../../roles/services/roles.service';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './user-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegister implements OnInit {

  auth = inject(AuthService);
  private fb      = inject(FormBuilder);
  private router  = inject(Router);
  readonly userService  = inject(UserService);
  readonly rolesService = inject(RolesService);
  readonly rolePolicyService = inject(RolePolicyService);

  readonly faUserPlus = faUserPlus;
  readonly faSpinner  = faSpinner;

  readonly documentTypes = ['CI', 'PASAPORTE'];
  readonly genders       = [
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

  ngOnInit(): void {
    this.rolesService.loadRoles().subscribe();
  }


  form = this.fb.group(
    {
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      documentType:    ['', Validators.required],
      documentNumber:  ['', Validators.required],
      phone:           [''],
      gender:          ['', Validators.required],
      rolesIds:        [[] as string[]],
    },
    { validators: passwordsMatchValidator },
  );


  toggleRole(id: string): void {
    const current = this.form.value.rolesIds ?? [];
    const updated = current.includes(id)
      ? current.filter(role => role !== id)
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

    const { documentType, documentNumber, phone, gender, confirmPassword, isActive, ...required } = this.form.value;

    const payload: CreateUserRequest = {
      firstName:  required.firstName!,
      lastName:   required.lastName!,
      email:      required.email!,
      password:   required.password!,
      rolesIds:   this.auth.hasPermission('user:create:roles') ? required.rolesIds! : null,
      phone:      this.auth.hasPermission('user:create:phone') ? phone : null,
      gender:     this.auth.hasPermission('user:create:gender') ? gender : null,
      ...(documentType   ? { documentType }   : {}),
      ...(documentNumber ? { documentNumber } : {}),
    };

    const activateImmediately = isActive && this.canActivateUser();

    this.userService.createUser(payload).pipe(
      switchMap(user => {
        if (activateImmediately && user.id) {
           return this.userService.updateUser(user.id, {
             firstName: payload.firstName,
             lastName: payload.lastName,
             rolesIds: payload.rolesIds,
             isActive: true,
             documentType: payload.documentType,
             documentNumber: payload.documentNumber,
             phone: payload.phone
           });
        }
        return of(user);
      })
    ).subscribe(() => {
      this.form.reset();
      this.router.navigate(['/usuarios/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/usuarios/list']);
  }
}
