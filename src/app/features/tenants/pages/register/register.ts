import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { TenantRegisterRequestDto } from '../../models/tenant.model';

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
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {

  private fb = inject(FormBuilder);
  readonly tenantService = inject(TenantService);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly documentTypes = ['CI', 'PASAPORTE'];
  
  readonly plans = [
    { id: 'BASIC', name: 'TENANTS.PLAN_BASIC', price: '0', icon: '🌱' },
    { id: 'PRO', name: 'TENANTS.PLAN_PRO', price: '49', icon: '🚀' },
    { id: 'ENTERPRISE', name: 'TENANTS.PLAN_ENTERPRISE', price: '99', icon: '🏢' }
  ];

  readonly genders = [
    { value: 'MALE',   label: 'TENANTS.GENDER_MALE' },
    { value: 'FEMALE', label: 'TENANTS.GENDER_FEMALE'  },
  ];

  protected form = this.fb.group(
    {
      tenantName:      ['', [Validators.required, Validators.minLength(3)]],
      adminFirstName:  ['', Validators.required],
      adminLastName:   ['', Validators.required],
      adminEmail:      ['', [Validators.required, Validators.email]],
      adminPassword:   ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      adminPhone:      [''],
      adminDocumentType: ['CI', Validators.required],
      adminDocumentNumber: ['', Validators.required],
      adminGender:     ['MALE', Validators.required],
      selectedPlan:    ['BASIC']
    },
    { validators: passwordsMatchValidator },
  );

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const request: TenantRegisterRequestDto = {
      tenantName: v.tenantName!,
      adminFirstName: v.adminFirstName!,
      adminLastName: v.adminLastName!,
      adminEmail: v.adminEmail!,
      adminPassword: v.adminPassword!,
      adminPhone: v.adminPhone || '',
      adminDocumentType: v.adminDocumentType!,
      adminDocumentNumber: v.adminDocumentNumber!,
      adminGender: v.adminGender!,
      selectedPlan: v.selectedPlan!
    };

    this.tenantService.startRegistration(request).subscribe();
  }
}
