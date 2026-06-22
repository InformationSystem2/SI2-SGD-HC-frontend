import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faFloppyDisk, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';
import { User, UpdateUserRequest } from '../../models/user.model';
import { TranslatePipe } from '@ngx-translate/core';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const errors: ValidationErrors = {};
  if (value.length < 8)     errors['minlength'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/[0-9]/.test(value)) errors['number']    = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-user-password',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './user-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPassword implements OnInit {

  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  readonly userService = inject(UserService);

  readonly faArrowLeft  = faArrowLeft;
  readonly faKey        = faKey;
  readonly faSpinner    = faSpinner;
  readonly faFloppyDisk = faFloppyDisk;

  readonly userId      = signal<string | null>(null);
  readonly currentUser = signal<User | null>(null);
  readonly loading     = signal(true);

  form = this.fb.group(
    {
      password:        ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.userId.set(id);

    this.userService.getUser(id).subscribe({
      next:  u  => { this.currentUser.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    const payload: UpdateUserRequest = {
      firstName:      user.firstName,
      lastName:       user.lastName,
      isActive:       user.isActive,
      rolesIds:       user.rolesIds,
      documentType:   user.documentType,
      documentNumber: user.documentNumber,
      phone:          user.phone,
      password:       this.form.value.password!,
    };

    this.userService.updateUser(this.userId()!, payload).subscribe(() => {
      this.router.navigate(['/users/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/users/list']);
  }
}
