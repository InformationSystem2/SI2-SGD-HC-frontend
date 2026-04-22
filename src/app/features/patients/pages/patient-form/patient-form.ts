import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { UpdatePatientRequest } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

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

  readonly faFloppyDisk = faFloppyDisk;
  readonly faSpinner    = faSpinner;

  readonly loadingPatient = signal(false);
  readonly notFound       = signal(false);
  patientId!: number;

  readonly documentTypes = ['CI', 'PASSPORT', 'OTHER'];
  readonly genders = [
    { value: 'male',   label: 'Masculino' },
    { value: 'female', label: 'Femenino'  },
  ];

  form = this.fb.group({
    firstName:      ['', Validators.required],
    lastName:       ['', Validators.required],
    documentType:   [''],
    documentNumber: [''],
    phone:          [''],
    gender:         [''],
    isActive:       [true],
    password:       [''],
    birthDate:      [''],
  });

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingPatient.set(true);

    this.patientService.getPatient(this.patientId).subscribe({
      next: patient => {
        this.form.patchValue({
          firstName:      patient.firstName,
          lastName:       patient.lastName,
          documentType:   patient.documentType ?? '',
          documentNumber: patient.documentNumber ?? '',
          phone:          patient.phone ?? '',
          gender:         patient.gender ?? '',
          isActive:       patient.isActive,
          birthDate:      patient.birthDate ?? '',
        });
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

    const v = this.form.value;
    const payload: UpdatePatientRequest = {
      firstName:  v.firstName!,
      lastName:   v.lastName!,
      isActive:   v.isActive!,
      ...(v.documentType   ? { documentType: v.documentType }     : {}),
      ...(v.documentNumber ? { documentNumber: v.documentNumber } : {}),
      ...(v.phone          ? { phone: v.phone }                   : {}),
      ...(v.gender         ? { gender: v.gender }                 : {}),
      ...(v.password       ? { password: v.password }             : {}),
      ...(v.birthDate      ? { birthDate: v.birthDate }           : {}),
    };

    this.patientService.updatePatient(this.patientId, payload).subscribe(() => {
      this.router.navigate(['/pacientes/list']);
    });
  }

  cancel(): void {
    this.router.navigate(['/pacientes/list']);
  }
}
