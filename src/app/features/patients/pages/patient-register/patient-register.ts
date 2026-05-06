import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { CreatePatientRequest } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

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

  readonly documentTypes = ['CI', 'PASAPORTE'];
  readonly genders = [
    { value: 'MALE',   label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino'  },
  ];

  form = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    documentType:   [''],
    documentNumber: [''],
    phone:          [''],
    address:        [''],
    gender:         [''],
    birthDate:      [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload: CreatePatientRequest = {
      firstName: v.firstName!,
      lastName:  v.lastName!,
      ...(v.documentType   ? { documentType: v.documentType }     : {}),
      ...(v.documentNumber ? { documentNumber: v.documentNumber } : {}),
      ...(v.phone          ? { phone: v.phone }                   : {}),
      ...(v.address        ? { address: v.address }               : {}),
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
