import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';

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
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {

  private fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly hidePassword = signal(true);
  readonly documentTypes = ['CI', 'PASAPORTE'];
  readonly genders = [
    { value: 'MALE',   label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino'  },
  ];

  protected form = this.fb.group(
    {
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      documentType:    [''],
      documentNumber:  [''],
      phone:           [''],
      gender:          [''],
    },
    { validators: passwordsMatchValidator },
  );

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.auth.register({
      firstName: v.firstName!,
      lastName:  v.lastName!,
      email:     v.email!,
      password:  v.password!,
      ...(v.documentType   ? { documentType: v.documentType }     : {}),
      ...(v.documentNumber ? { documentNumber: v.documentNumber } : {}),
      ...(v.phone          ? { phone: v.phone }                   : {}),
      ...(v.gender         ? { gender: v.gender }                 : {}),
    }).subscribe();
  }
}
