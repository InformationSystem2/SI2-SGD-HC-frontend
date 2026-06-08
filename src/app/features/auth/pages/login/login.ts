import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { BrandingService } from '../../../../core/services/branding.service';
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
  const pw  = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {

  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  branding = inject(BrandingService);  
  hidePassword = signal(true);
  hideResetPassword = signal(true);
  hideConfirmPassword = signal(true);
  
  view = signal<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  codeSent = signal(false);

  readonly features = [
    { label: 'Gestión centralizada de historias clínicas' },
    { label: 'Control de acceso por roles y permisos' },
    { label: 'Documentos digitales con firma electrónica' },
  ];

  protected form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    newPassword: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  protected setView(newView: 'LOGIN' | 'FORGOT_PASSWORD') {
    this.view.set(newView);
    if (newView === 'LOGIN') {
      this.resetForm.reset();
      this.codeSent.set(false);
    }
  }

  protected requestRecoveryCode() {
    const emailCtrl = this.resetForm.get('email');
    if (emailCtrl?.invalid) {
      emailCtrl.markAsTouched();
      return;
    }
    this.auth.forgotPassword({ email: emailCtrl?.value ?? '' }).subscribe({
      next: (res) => {
        this.codeSent.set(true);
        if (res?.code) {
          this.resetForm.patchValue({ code: res.code });
        }
      }
    });
  }

  protected onResetPasswordSubmit() {
    if (this.resetForm.invalid || !this.codeSent()) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const { email, code, newPassword } = this.resetForm.getRawValue();
    this.auth.resetPassword({ email: email!, code: code!, newPassword: newPassword! }).subscribe({
      next: () => this.setView('LOGIN')
    });
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    const {username, password} = this.form.getRawValue();
    this.auth.login({ username: username!, password: password! }).subscribe();
  }
}
