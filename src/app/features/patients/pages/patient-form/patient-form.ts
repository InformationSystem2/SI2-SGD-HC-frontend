import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { UpdatePatientRequest } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-patient-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './patient-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientForm implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  readonly patientService = inject(PatientService);
  readonly auth = inject(AuthService);

  readonly faFloppyDisk = faFloppyDisk;
  readonly faSpinner    = faSpinner;

  readonly loadingPatient = signal(false);
  readonly notFound       = signal(false);
  patientId!: string;

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
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.loadingPatient.set(true);

    this.patientService.getPatient(this.patientId).subscribe({
      next: patient => {
        this.form.patchValue({
          firstName:      patient.firstName,
          lastName:       patient.lastName,
          documentType:   patient.documentType ?? '',
          documentNumber: patient.documentNumber ?? '',
          phone:          patient.phone ?? '',
          address:        patient.address ?? '',
          gender:         patient.gender,
          birthDate:      patient.birthDate,
        });

        if (!this.auth.hasPermission('patient:update:gender')) {
          this.form.get('gender')?.disable();
        }
        if (!this.auth.hasPermission('patient:update:document_type')) {
          this.form.get('documentType')?.disable();
        }

        this.loadingPatient.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loadingPatient.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawVal = this.form.getRawValue();
    const payload: UpdatePatientRequest = {
      firstName: this.auth.hasPermission('patient:update:first_name') ? (rawVal.firstName || '') : (rawVal.firstName || ''),
      lastName:  this.auth.hasPermission('patient:update:last_name') ? (rawVal.lastName || '') : (rawVal.lastName || ''),
      documentType: this.auth.hasPermission('patient:update:document_type') ? (rawVal.documentType || undefined) : undefined,
      documentNumber: this.auth.hasPermission('patient:update:document_number') ? (rawVal.documentNumber || undefined) : undefined,
      phone: this.auth.hasPermission('patient:update:phone') ? (rawVal.phone || undefined) : undefined,
      address: this.auth.hasPermission('patient:update:address') ? (rawVal.address || undefined) : undefined,
      gender: this.auth.hasPermission('patient:update:gender') ? (rawVal.gender || undefined) : undefined,
      birthDate: this.auth.hasPermission('patient:update:birth_date') ? (rawVal.birthDate || undefined) : undefined,
    };

    this.patientService.updatePatient(this.patientId, payload).subscribe(() => {
      this.router.navigate(['/pacientes/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/pacientes/list']);
  }
}
