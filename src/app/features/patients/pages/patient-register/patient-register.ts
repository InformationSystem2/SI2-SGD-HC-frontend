import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { CreatePatientRequest } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-patient-register',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './patient-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientRegister implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  readonly patientService = inject(PatientService);
  readonly auth = inject(AuthService);

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
    gender:         ['', Validators.required],
    birthDate:      ['', Validators.required],
  });

  ngOnInit(): void {
    if (!this.auth.hasPermission('patient:create:gender')) {
      this.form.get('gender')?.clearValidators();
      this.form.get('gender')?.updateValueAndValidity();
    }
    if (!this.auth.hasPermission('patient:create:birth_date')) {
      this.form.get('birthDate')?.clearValidators();
      this.form.get('birthDate')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload: CreatePatientRequest = {
      firstName: v.firstName!,
      lastName:  v.lastName!,
      documentType: this.auth.hasPermission('patient:create:document_type') ? (v.documentType || undefined) : undefined,
      documentNumber: this.auth.hasPermission('patient:create:document_number') ? (v.documentNumber || undefined) : undefined,
      phone: this.auth.hasPermission('patient:create:phone') ? (v.phone || undefined) : undefined,
      address: this.auth.hasPermission('patient:create:address') ? (v.address || undefined) : undefined,
      gender: this.auth.hasPermission('patient:create:gender') ? (v.gender || undefined) : undefined,
      birthDate: this.auth.hasPermission('patient:create:birth_date') ? (v.birthDate || undefined) : undefined,
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
