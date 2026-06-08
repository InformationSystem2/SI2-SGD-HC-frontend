import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenantService } from '../../../services/tenant.service';
import { TenantRegisterRequestDto } from '../../../models/tenant.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressStepperComponent } from '../../../components/progress-stepper/progress-stepper';

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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, ProgressStepperComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected tenantService = inject(TenantService);
  protected translate = inject(TranslateService);

  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly documentTypes = ['CI', 'PASAPORTE'];

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
      adminDocumentNumber: ['55555', Validators.required],
      adminGender:     ['MALE', Validators.required]
    },
    { validators: passwordsMatchValidator },
  );

  ngOnInit(): void {
    const flowData = this.tenantService.getFlowData();
    if (!flowData) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    if (flowData.registrationData.tenantName) {
      this.form.patchValue({
        tenantName: flowData.registrationData.tenantName,
        adminFirstName: flowData.registrationData.adminFirstName,
        adminLastName: flowData.registrationData.adminLastName,
        adminEmail: flowData.registrationData.adminEmail,
        adminPhone: flowData.registrationData.adminPhone,
        adminDocumentType: flowData.registrationData.adminDocumentType,
        adminDocumentNumber: flowData.registrationData.adminDocumentNumber,
        adminGender: flowData.registrationData.adminGender
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const flowData = this.tenantService.getFlowData();
    if (!flowData) {
      this.router.navigate(['/tenants/select-plan']);
      return;
    }

    const v = this.form.value;

    this.tenantService.updateRegistrationData({
      tenantName: v.tenantName!,
      adminFirstName: v.adminFirstName!,
      adminLastName: v.adminLastName!,
      adminEmail: v.adminEmail!,
      adminPhone: v.adminPhone || '',
      adminDocumentType: v.adminDocumentType!,
      adminDocumentNumber: v.adminDocumentNumber!,
      adminGender: v.adminGender!
    });

    const request: TenantRegisterRequestDto = {
      sessionToken: flowData.sessionToken,
      tenantName: v.tenantName!,
      adminFirstName: v.adminFirstName!,
      adminLastName: v.adminLastName!,
      adminEmail: v.adminEmail!,
      adminPassword: v.adminPassword!,
      adminPhone: v.adminPhone || '',
      adminDocumentType: v.adminDocumentType!,
      adminDocumentNumber: v.adminDocumentNumber!,
      adminGender: v.adminGender!
    };

    this.tenantService.startRegistration(request).subscribe();
  }

  protected goBack(): void {
    this.router.navigate(['/tenants/select-plan']);
  }
}
