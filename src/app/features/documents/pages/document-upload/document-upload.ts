import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCloudArrowUp, faFile, faSpinner, faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../../patients/models/patient.model';
import { PatientService } from '../../../patients/services/patient.service';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-upload',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './document-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentUpload implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  readonly patientService  = inject(PatientService);
  readonly documentService = inject(DocumentService);

  readonly faArrowLeft      = faArrowLeft;
  readonly faCloudArrowUp   = faCloudArrowUp;
  readonly faFile           = faFile;
  readonly faSpinner        = faSpinner;
  readonly faTimesCircle    = faTimesCircle;

  readonly selectedFile  = signal<File | null>(null);
  readonly uploading     = signal(false);
  readonly uploadError   = signal<string | null>(null);

  /** Formatos aceptados. Las imágenes DICOM se manejan en su propio apartado. */
  readonly acceptedFormats = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.txt,.csv';

  /** Extensiones DICOM que NO se aceptan aquí. */
  private readonly dicomExtensions = ['.dcm', '.dicom'];

  form = this.fb.group({
    patientId: ['', Validators.required],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
    notes:     [''],
  });

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.uploadError.set(null);

    if (file && this.isDicom(file)) {
      input.value = '';
      this.selectedFile.set(null);
      this.uploadError.set('Las imágenes DICOM no se suben aquí. Usa el apartado de Imágenes DICOM.');
      return;
    }

    this.selectedFile.set(file);
  }

  /** Detecta archivos DICOM por extensión o tipo MIME. */
  private isDicom(file: File): boolean {
    const name = file.name.toLowerCase();
    const byExt  = this.dicomExtensions.some(ext => name.endsWith(ext));
    const byMime = file.type === 'application/dicom';
    return byExt || byMime;
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024)       return `${bytes} B`;
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
      this.uploadError.set('Selecciona un archivo');
      return;
    }
    if (this.isDicom(file)) {
      this.uploadError.set('Las imágenes DICOM no se suben aquí. Usa el apartado de Imágenes DICOM.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);

    // Paso 1: subir el archivo
    this.documentService.uploadFile(file).subscribe({
      next: ({ url }) => {
        const v = this.form.value;
        // Paso 2: crear el registro del documento externo
        this.documentService.createExternal({
          patientId: v.patientId!,
          fileUrl:   url,
          issueDate: v.issueDate!,
          notes:     v.notes ?? undefined,
        }).subscribe({
          next: () => {
            this.uploading.set(false);
            this.router.navigate(['/documents/list']);
          },
          error: err => {
            this.uploading.set(false);
            this.uploadError.set(err.error?.message ?? 'Error al guardar el documento');
          },
        });
      },
      error: err => {
        this.uploading.set(false);
        this.uploadError.set(err.error?.message ?? 'Error al subir el archivo');
      },
    });
  }

  back(): void {
    this.router.navigate(['/documents/list']);
  }
}
