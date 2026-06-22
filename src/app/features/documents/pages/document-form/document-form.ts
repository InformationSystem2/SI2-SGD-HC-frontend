import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faFileSignature, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentTemplate, UiSchema } from '../../models/document.model';
import { DocumentTemplateService } from '../../services/document-template.service';
import { DocumentService } from '../../services/document.service';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form';
import { PatientService } from '../../../patients/services/patient.service';
import { Patient } from '../../../patients/models/patient.model';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-document-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe, DynamicFormComponent],
  templateUrl: './document-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentForm implements OnInit {

  private fb              = inject(FormBuilder);
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);
  readonly templateService = inject(DocumentTemplateService);
  readonly documentService = inject(DocumentService);
  readonly patientService  = inject(PatientService);
  readonly auth            = inject(AuthService);

  readonly faArrowLeft      = faArrowLeft;
  readonly faFileSignature  = faFileSignature;
  readonly faSpinner        = faSpinner;

  readonly template        = signal<DocumentTemplate | null>(null);
  readonly loadingTemplate = signal(false);
  readonly notFound        = signal(false);
  readonly patients        = signal<Patient[]>([]);

  /** Formulario de cabecera: paciente + fecha */
  headerForm = this.fb.group({
    patientId: ['', Validators.required],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit(): void {
    const templateId = this.route.snapshot.paramMap.get('templateId');
    if (!templateId) {
      this.router.navigate(['/documents/templates']);
      return;
    }

    this.loadingTemplate.set(true);
    this.templateService.getById(templateId).subscribe({
      next: t => {
        this.template.set(t);
        this.loadingTemplate.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loadingTemplate.set(false);
      },
    });

    this.patientService.getPatients().subscribe({
      next: list => this.patients.set(list),
    });

    if (!this.auth.hasPermission('document:create:patient')) {
      this.headerForm.get('patientId')?.disable();
      this.headerForm.get('patientId')?.clearValidators();
      this.headerForm.get('patientId')?.updateValueAndValidity();
    }
    if (!this.auth.hasPermission('document:create:issue_date')) {
      this.headerForm.get('issueDate')?.disable();
      this.headerForm.get('issueDate')?.clearValidators();
      this.headerForm.get('issueDate')?.updateValueAndValidity();
    }
  }

  patientLabel(p: Patient): string {
    const doc = p.documentNumber ? ` — ${p.documentNumber}` : '';
    return `${p.firstName} ${p.lastName}${doc}`;
  }

  /** Llamado por DynamicFormComponent al emitir (submitted) */
  onClinicalContentReady(clinicalContent: Record<string, unknown>): void {
    if (this.headerForm.invalid) {
      this.headerForm.markAllAsTouched();
      return;
    }

    const h = this.headerForm.getRawValue();
    const t = this.template();
    if (!t) return;

    this.documentService.create({
      patientId:      this.auth.hasPermission('document:create:patient') ? (h.patientId || '') : '',
      templateId:     t.id,
      clinicalContent: this.auth.hasPermission('document:create:clinical_content') ? clinicalContent : {},
      issueDate:      this.auth.hasPermission('document:create:issue_date') ? (h.issueDate || '') : '',
    }).subscribe(() => {
      this.router.navigate(['/documents/templates']);
    });
  }

  get uiSchema(): UiSchema {
    return this.template()?.uiSchema ?? {};
  }

  back(): void {
    this.router.navigate(['/documents/templates']);
  }
}
