import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUser, 
  faKey, 
  faLock, 
  faFloppyDisk, 
  faSpinner, 
  faCheckCircle, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Icon definitions
  readonly faUser = faUser;
  readonly faKey = faKey;
  readonly faLock = faLock;
  readonly faSpinner = faSpinner;
  readonly faFloppyDisk = faFloppyDisk;
  readonly faCheckCircle = faCheckCircle;
  readonly faExclamationTriangle = faExclamationTriangle;

  // Page States
  readonly activeTab = signal<'info' | 'password'>('info');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Constants
  readonly documentTypes = ['CI', 'PASAPORTE'];
  readonly genders = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
  ];

  // Forms
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documentType: ['', Validators.required],
    documentNumber: ['', Validators.required],
    phone: [''],
    gender: [''],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          documentType: profile.documentType ?? '',
          documentNumber: profile.documentNumber ?? '',
          phone: profile.phone ?? '',
          gender: profile.gender ?? '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Error al cargar los datos del perfil.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'info' | 'password'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onSubmitInfo(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Perfil actualizado exitosamente.');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message ?? 'Error al actualizar el perfil.');
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!,
    };

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Contraseña actualizada exitosamente.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message ?? 'La contraseña actual es incorrecta.');
      }
    });
  }
}
