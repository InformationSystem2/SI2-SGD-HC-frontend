import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { CreatePatientRequest } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

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
  selector: 'app-patient-register',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './patient-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRegister {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  readonly patientService = inject(PatientService);

  readonly faUserPlus = faUserPlus;
  readonly faSpinner  = faSpinner;

  readonly documentTypes = ['CI', 'PASSPORT', 'OTHER'];
  readonly genders = [
    { value: 'male',   label: 'Masculino' },
    { value: 'female', label: 'Femenino'  },
  ];

  form = this.fb.group(
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
      birthDate:       [''],
    },
    { validators: passwordsMatchValidator },
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload: CreatePatientRequest = {
      firstName: v.firstName!,
      lastName:  v.lastName!,
      email:     v.email!,
      password:  v.password!,
      ...(v.documentType   ? { documentType: v.documentType }     : {}),
      ...(v.documentNumber ? { documentNumber: v.documentNumber } : {}),
      ...(v.phone          ? { phone: v.phone }                   : {}),
      ...(v.gender         ? { gender: v.gender }                 : {}),
      ...(v.birthDate      ? { birthDate: v.birthDate }           : {}),
    };

    this.patientService.createPatient(payload).subscribe(() => {
      this.form.reset();
      this.router.navigate(['/pacientes/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/pacientes/list']);
  }
}
