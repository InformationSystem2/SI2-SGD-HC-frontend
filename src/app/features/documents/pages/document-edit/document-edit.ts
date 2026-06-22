import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faEdit, faSpinner, faFileWord, faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { DocumentService } from '../../services/document.service';
import { Document, DocumentStatus } from '../../models/document.model';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-document-edit',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './document-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEdit implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private fb     = inject(FormBuilder);
  private docSvc = inject(DocumentService);
  readonly auth = inject(AuthService);

  readonly faArrowLeft   = faArrowLeft;
  readonly faEdit        = faEdit;
  readonly faSpinner     = faSpinner;
  readonly faFileWord    = faFileWord;
  readonly faCircleCheck = faCircleCheck;

  readonly doc      = signal<Document | null>(null);
  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly saved    = signal(false);
  readonly error    = signal<string | null>(null);

  readonly statuses: { value: DocumentStatus; label: string }[] = [
    { value: 'DRAFT',          label: 'Borrador' },
    { value: 'PENDING_REVIEW', label: 'En revisión' },
    { value: 'REJECTED',       label: 'Rechazado' },
    { value: 'FINALIZED',      label: 'Finalizado' },
  ];

  form = this.fb.group({
    issueDate:  ['', Validators.required],
    expiryDate: [''],
    status:     ['' as DocumentStatus],
  });

  private docId = '';

  ngOnInit(): void {
    this.docId = this.route.snapshot.paramMap.get('id')!;
    this.docSvc.getById(this.docId).subscribe({
      next: d => {
        this.doc.set(d);
        this.form.patchValue({
          issueDate:  d.issueDate,
          expiryDate: d.expiryDate ?? '',
          status:     d.status,
        });

        if (!this.auth.hasPermission('document:update:issue_date')) {
          this.form.get('issueDate')?.disable();
        }
        if (!this.auth.hasPermission('document:update:expiry_date')) {
          this.form.get('expiryDate')?.disable();
        }
        if (!this.auth.hasPermission('document:update:status')) {
          this.form.get('status')?.disable();
        }

        this.loading.set(false);
      },
      error: e => {
        this.error.set(e.error?.message ?? 'Error al cargar el documento');
        this.loading.set(false);
      },
    });
  }

  docTitle(): string {
    const d = this.doc();
    if (!d) return '';
    const t = d.clinicalContent?.['titulo'];
    return typeof t === 'string' && t.trim() ? t : d.templateName;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.docSvc.update(this.docId, {
      issueDate:  this.auth.hasPermission('document:update:issue_date') ? v.issueDate! : (this.doc()?.issueDate || ''),
      expiryDate: this.auth.hasPermission('document:update:expiry_date') ? (v.expiryDate || undefined) : undefined,
      status:     this.auth.hasPermission('document:update:status') ? (v.status as DocumentStatus || undefined) : undefined,
    }).subscribe({
      next: () => { this.saving.set(false); this.saved.set(true); },
      error: e => { this.saving.set(false); this.error.set(e.error?.message ?? 'Error al guardar'); },
    });
  }

  openInOnlyOffice(): void {
    this.router.navigate(['/documents/editor'], {
      queryParams: { docId: this.docId },
    });
  }

  back(): void {
    this.router.navigate(['/documents/list']);
  }
}
