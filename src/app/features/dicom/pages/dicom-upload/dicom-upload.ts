import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCloudArrowUp, faFile, faSpinner, faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../../patients/models/patient.model';
import { PatientService } from '../../../patients/services/patient.service';
import { DicomService } from '../../services/dicom.service';

@Component({
  selector: 'app-dicom-upload',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './dicom-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomUpload implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  readonly patientService = inject(PatientService);
  readonly dicomService   = inject(DicomService);

  readonly faArrowLeft    = faArrowLeft;
  readonly faCloudArrowUp = faCloudArrowUp;
  readonly faFile         = faFile;
  readonly faSpinner      = faSpinner;
  readonly faTimesCircle  = faTimesCircle;

  readonly selectedFile = signal<File | null>(null);
  readonly fileError    = signal<string | null>(null);
  readonly patients     = signal<Patient[]>([]);

  form = this.fb.group({
    patientId: ['', Validators.required],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit(): void {
    // Cargar lista de pacientes
    this.patientService.getPatients().subscribe({
      next: list => this.patients.set(list),
    });

    // Pre-llenar patientId si viene como query param
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    if (patientId) {
      this.form.patchValue({ patientId });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.fileError.set(null);

    if (file) {
      if (!file.name.toLowerCase().endsWith('.dcm')) {
        this.fileError.set('Solo se aceptan archivos con extensión .dcm');
        this.selectedFile.set(null);
        input.value = '';
        return;
      }
      const MAX_MB = 50;
      if (file.size > MAX_MB * 1024 * 1024) {
        this.fileError.set(`El archivo supera el límite de ${MAX_MB} MB`);
        this.selectedFile.set(null);
        input.value = '';
        return;
      }
    }

    this.selectedFile.set(file);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.fileError.set(null);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const file = this.selectedFile();
    if (!file) {
      this.fileError.set('Selecciona un archivo .dcm');
      return;
    }

    const v = this.form.value;
    this.dicomService.upload({
      file,
      patientId: v.patientId!,
      issueDate: v.issueDate!,
    }).subscribe(() => {
      this.router.navigate(['/dicom/patient', v.patientId]);
    });
  }

  back(): void {
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    if (patientId) {
      this.router.navigate(['/dicom/patient', patientId]);
    } else {
      this.router.navigate(['/pacientes/list']);
    }
  }

  patientLabel(p: Patient): string {
    const doc = p.documentNumber ? ` — ${p.documentNumber}` : '';
    return `${p.firstName} ${p.lastName}${doc}`;
  }
}
