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
import {
  faArrowLeft, faFileWord, faSpinner, faCircleCheck,
  faTriangleExclamation, faUpload, faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentEditorModule } from '@onlyoffice/document-editor-angular';
import { environment } from '../../../../../environments/environment';
import { PatientService } from '../../../patients/services/patient.service';
import { DocumentService } from '../../services/document.service';

type EditorMode = 'create' | 'edit' | 'view';
type CreateTab  = 'new' | 'upload';
type OoDocType  = 'WORD' | 'CELL' | 'SLIDE';

interface OOSession {
  documentId:      string;
  docKey:          string;
  documentServerUrl: string;
  emptyDocUrl:     string;
  callbackUrl:     string;
  configToken:     string;
  fileType:        string;   // docx | xlsx | pptx
  ooDocumentType:  string;   // word | cell | slide
}

@Component({
  selector: 'app-document-editor',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe, DocumentEditorModule],
  templateUrl: './document-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentEditorPage implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  readonly patientService  = inject(PatientService);
  readonly documentService = inject(DocumentService);

  readonly faArrowLeft           = faArrowLeft;
  readonly faFileWord            = faFileWord;
  readonly faSpinner             = faSpinner;
  readonly faCircleCheck         = faCircleCheck;
  readonly faTriangleExclamation = faTriangleExclamation;
  readonly faUpload              = faUpload;
  readonly faPlus                = faPlus;

  readonly session      = signal<OOSession | null>(null);
  readonly editorConfig = signal<object | null>(null);
  readonly opening      = signal(false);
  readonly saved        = signal(false);
  readonly openError    = signal<string | null>(null);
  readonly mode         = signal<EditorMode>('create');
  readonly activeTab    = signal<CreateTab>('new');
  readonly uploading    = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly docType      = signal<OoDocType>('WORD');

  readonly docTypes: { value: OoDocType; label: string; ext: string; accept: string }[] = [
    { value: 'WORD',  label: 'Documento Word',        ext: 'docx', accept: '.docx' },
    { value: 'CELL',  label: 'Hoja de cálculo',       ext: 'xlsx', accept: '.xlsx' },
    { value: 'SLIDE', label: 'Presentación',           ext: 'pptx', accept: '.pptx' },
  ];

  get currentDocType() { return this.docTypes.find(d => d.value === this.docType())!; }
  get uploadAccept()   { return this.docTypes.map(d => d.accept).join(','); }

  readonly docServerUrl = environment.onlyofficeDocServerUrl;

  form = this.fb.group({
    patientId: ['', Validators.required],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
    title:     ['Documento clínico'],
  });

  uploadForm = this.fb.group({
    patientId: ['', Validators.required],
    issueDate: [new Date().toISOString().split('T')[0], Validators.required],
    title:     [''],
  });

  ngOnInit(): void {
    const docId    = this.route.snapshot.queryParamMap.get('docId');
    const viewOnly = this.route.snapshot.queryParamMap.get('mode') === 'view';

    if (docId && viewOnly) {
      this.mode.set('view');
      this.loadExisting(docId, true);
    } else if (docId) {
      this.mode.set('edit');
      this.loadExisting(docId, false);
    } else {
      this.mode.set('create');
      this.patientService.getPatients().subscribe();
    }
  }

  private loadExisting(docId: string, viewOnly: boolean): void {
    this.opening.set(true);
    this.openError.set(null);

    const req$ = viewOnly
      ? this.documentService.openOnlyofficeViewSession(docId)
      : this.documentService.openOnlyofficeSession(docId);

    req$.subscribe({
      next: s => {
        this.session.set(s);
        this.editorConfig.set(this.buildConfig(s, viewOnly));
        this.opening.set(false);
      },
      error: err => {
        this.openError.set(err.error?.message ?? 'Error al abrir el editor');
        this.opening.set(false);
      },
    });
  }

  /** Crea un documento nuevo vacío. */
  openNew(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.opening.set(true);
    this.openError.set(null);
    this.saved.set(false);

    const v = this.form.value;
    this.documentService.createOnlyofficeSession({
      patientId: v.patientId!,
      issueDate: v.issueDate!,
      title:     v.title ?? undefined,
      docType:   this.docType(),
    }).subscribe({
      next: s => {
        this.session.set(s);
        this.editorConfig.set(this.buildConfig(s, false));
        this.opening.set(false);
      },
      error: err => {
        this.openError.set(err.error?.message ?? 'Error al abrir el editor');
        this.opening.set(false);
      },
    });
  }

  /** Sube el .docx seleccionado y abre el editor con ese archivo. */
  openUploaded(): void {
    if (this.uploadForm.invalid) { this.uploadForm.markAllAsTouched(); return; }
    if (!this.selectedFile()) { this.openError.set('Selecciona un archivo .docx'); return; }

    this.uploading.set(true);
    this.openError.set(null);

    this.documentService.uploadFile(this.selectedFile()!).subscribe({
      next: ({ url }) => {
        const v = this.uploadForm.value;
        this.documentService.createOnlyofficeSession({
          patientId: v.patientId!,
          issueDate: v.issueDate!,
          title:     v.title || this.selectedFile()!.name.replace(/\.(docx|xlsx|pptx)$/i, ''),
          fileUrl:   url,
        }).subscribe({
          next: s => {
            this.session.set(s);
            this.editorConfig.set(this.buildConfig(s, false));
            this.uploading.set(false);
          },
          error: err => {
            this.openError.set(err.error?.message ?? 'Error al abrir el editor');
            this.uploading.set(false);
          },
        });
      },
      error: err => {
        this.openError.set(err.error?.message ?? 'Error al subir el archivo');
        this.uploading.set(false);
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    if (!file) return;
    // Auto-detectar tipo
    if (file.name.endsWith('.xlsx')) this.docType.set('CELL');
    else if (file.name.endsWith('.pptx')) this.docType.set('SLIDE');
    else this.docType.set('WORD');
    // Rellenar título si está vacío
    if (!this.uploadForm.value.title) {
      this.uploadForm.patchValue({ title: file.name.replace(/\.(docx|xlsx|pptx)$/i, '') });
    }
  }

  setDocType(type: OoDocType): void { this.docType.set(type); }

  private buildConfig(s: OOSession, viewOnly: boolean): object {
    const cfg: Record<string, unknown> = {
      document: {
        fileType: s.fileType || 'docx',
        key:      s.docKey,
        title:    'Documento',
        url:      s.emptyDocUrl,
        permissions: { edit: !viewOnly, download: true, print: true },
      },
      documentType: s.ooDocumentType || 'word',
      editorConfig: {
        ...(s.callbackUrl ? { callbackUrl: s.callbackUrl } : {}),
        lang: 'es',
        mode: viewOnly ? 'view' : 'edit',
      },
    };
    if (s.configToken) cfg['token'] = s.configToken;
    return cfg;
  }

  onDocumentStateChange = (event: object): void => {
    if ((event as { data?: boolean })?.data === false) this.saved.set(true);
  };

  setTab(tab: CreateTab): void { this.activeTab.set(tab); }

  back(): void { this.router.navigate(['/documentos/list']); }

  isLoading(): boolean { return this.opening() || this.uploading(); }
}
