import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { UpdateUserRequest } from '../../models/user.model';
import { TranslatePipe } from '@ngx-translate/core';

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

  readonly faUsers       = faUsers;
  readonly faSpinner     = faSpinner;
  readonly faFloppyDisk  = faFloppyDisk;

  readonly editId = signal<number | null>(null);

  readonly documentTypes = ['CI', 'PASSPORT', 'OTHER'];
  readonly genders = [
    { value: 'male',   label: 'Masculino' },
    { value: 'female', label: 'Femenino'  },
  ];

  form = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    documentType:   [''],
    documentNumber: [''],
    phone:          [''],
    gender:         [''],
    isActive:       [true],
    rolesIds:       [[] as number[], Validators.required],
  });

  ngOnInit(): void {
    this.rolesService.loadRoles().subscribe();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = Number(id);
      this.editId.set(numId);

      this.userService.getUser(numId).subscribe(user => {
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

  toggleRole(id: number): void {
    const current = this.form.value.rolesIds ?? [];
    const updated = current.includes(id)
      ? current.filter(r => r !== id)
      : [...current, id];
    this.form.patchValue({ rolesIds: updated });
  }

  isRoleSelected(id: number): boolean {
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
