import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faFileWord, faFileExcel, faFilePowerpoint, faFilePdf,
  faSpinner, faCircleCheck, faTriangleExclamation,
  faUpload, faPlus, faExpand, faCompress,
  faChevronDown, faChevronUp, faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentEditorModule } from '@onlyoffice/document-editor-angular';
import { environment } from '../../../../../environments/environment';
import { PatientService } from '../../../patients/services/patient.service';
import { DocumentService } from '../../services/document.service';
import { Document, DocumentStatus } from '../../models/document.model';
import { DocumentVersionHistoryComponent } from '../../components/document-version-history/document-version-history';

type EditorMode = 'create' | 'edit' | 'view';
type CreateTab  = 'new' | 'upload';
type OoDocType  = 'WORD' | 'CELL' | 'SLIDE' | 'PDF';

interface OOSession {
  documentId:      string;
  docKey:          string;
  documentServerUrl: string;
  emptyDocUrl:     string;
  callbackUrl:     string;
  configToken:     string;
  fileType:        string;   // docx | xlsx | pptx | pdf
  ooDocumentType:  string;   // word | cell | slide
}

@Component({
  selector: 'app-document-editor',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe, DocumentEditorModule, DocumentVersionHistoryComponent],
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
  readonly faFileExcel           = faFileExcel;
  readonly faFilePowerpoint      = faFilePowerpoint;
  readonly faFilePdf             = faFilePdf;
  readonly faSpinner             = faSpinner;
  readonly faCircleCheck         = faCircleCheck;
  readonly faTriangleExclamation = faTriangleExclamation;
  readonly faUpload              = faUpload;
  readonly faPlus                = faPlus;
  readonly faExpand              = faExpand;
  readonly faCompress            = faCompress;
  readonly faChevronDown         = faChevronDown;
  readonly faChevronUp           = faChevronUp;
  readonly faInfoCircle          = faInfoCircle;

  readonly fullscreen = signal(false);

  toggleFullscreen(): void { this.fullscreen.update(v => !v); }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.fullscreen()) this.fullscreen.set(false); }

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

  readonly showMetadataPanel = signal(false);

  toggleMetadataPanel(): void {
    this.showMetadataPanel.update(v => !v);
  }

  readonly docTypes: { value: OoDocType; label: string; ext: string; accept: string }[] = [
    { value: 'WORD',  label: 'Documento Word',        ext: 'docx', accept: '.docx' },
    { value: 'CELL',  label: 'Hoja de cálculo',       ext: 'xlsx', accept: '.xlsx' },
    { value: 'SLIDE', label: 'Presentación',           ext: 'pptx', accept: '.pptx' },
    { value: 'PDF',   label: 'Documento PDF',         ext: 'pdf',  accept: '.pdf' },
  ];

  get currentDocType() { return this.docTypes.find(d => d.value === this.docType())!; }
  get uploadAccept()   { return this.docTypes.map(d => d.accept).join(','); }

  readonly docServerUrl = environment.onlyofficeDocServerUrl;

  readonly doc = signal<Document | null>(null);

  readonly statuses: { value: DocumentStatus; label: string }[] = [
    { value: 'DRAFT',             label: 'Borrador' },
    { value: 'PENDING_REVIEW',    label: 'Pendiente de revisión' },
    { value: 'REJECTED',          label: 'Rechazado' },
    { value: 'FINALIZED',         label: 'Finalizado' },
  ];

  statusLabel(status: string): string {
    return ({
      DRAFT:          'Borrador',
      PENDING_REVIEW: 'En revisión',
      REJECTED:       'Rechazado',
      FINALIZED:      'Finalizado',
    } as Record<string, string>)[status] ?? status;
  }

  statusClass(status: string): string {
    return ({
      DRAFT:          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PENDING_REVIEW: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
      REJECTED:       'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
      FINALIZED:      'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    } as Record<string, string>)[status] ?? 'bg-hc-muted text-hc-text-2';
  }

  contentEntries(): { key: string; value: any }[] {
    const content = this.doc()?.clinicalContent ?? {};
    return Object.entries(content).map(([key, value]) => ({
      key:     key.replace(/_/g, ' '),
      value,
    }));
  }

  metadataForm = this.fb.group({
    title:      [''],
    issueDate:  ['', Validators.required],
    expiryDate: [''],
    status:     ['' as DocumentStatus],
  });

  readonly savingMetadata = signal(false);
  readonly metadataSaved = signal(false);
  readonly metadataError = signal<string | null>(null);

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
    const docId     = this.route.snapshot.queryParamMap.get('docId');
    const versionId = this.route.snapshot.queryParamMap.get('versionId');
    const viewOnly  = this.route.snapshot.queryParamMap.get('mode') === 'view';

    if (docId && versionId) {
      this.mode.set('view');
      this.loadVersion(docId, versionId);
    } else if (docId && viewOnly) {
      this.mode.set('view');
      this.loadExisting(docId, true);
    } else if (docId) {
      this.mode.set('edit');
      this.loadExisting(docId, false);
    } else {
      this.mode.set('create');
      this.patientService.getPatients().subscribe();

      // Si llegamos desde la Historia Clínica de un paciente, preseleccionarlo.
      const patientId = this.route.snapshot.queryParamMap.get('patientId');
      if (patientId) {
        this.form.patchValue({ patientId });
        this.uploadForm.patchValue({ patientId });
      }
    }
  }

  private loadVersion(docId: string, versionId: string): void {
    this.opening.set(true);
    this.openError.set(null);

    this.documentService.openOnlyofficeVersionViewSession(docId, versionId).subscribe({
      next: (s: OOSession) => {
        this.session.set(s);
        this.editorConfig.set(this.buildConfig(s, true));
        this.opening.set(false);
      },
      error: (err: any) => {
        this.openError.set(err.error?.message ?? 'Error al abrir la versión');
        this.opening.set(false);
      },
    });
  }

  private loadExisting(docId: string, viewOnly: boolean): void {
    this.opening.set(true);
    this.openError.set(null);

    // Cargar metadatos del documento
    this.documentService.getById(docId).subscribe({
      next: d => {
        this.doc.set(d);
        this.metadataForm.patchValue({
          title:      d.clinicalContent?.['titulo'] as string ?? d.templateName ?? '',
          issueDate:  d.issueDate,
          expiryDate: d.expiryDate ?? '',
          status:     d.status,
        });
      },
      error: () => {}
    });

    const req$ = viewOnly
      ? this.documentService.openOnlyofficeViewSession(docId)
      : this.documentService.openOnlyofficeSession(docId);

    req$.subscribe({
      next: (s: OOSession) => {
        this.session.set(s);
        this.editorConfig.set(this.buildConfig(s, viewOnly));
        this.opening.set(false);
      },
      error: (err: any) => {
        this.openError.set(err.error?.message ?? 'Error al abrir el editor');
        this.opening.set(false);
      },
    });
  }

  saveMetadata(): void {
    const docId = this.session()?.documentId;
    if (!docId) return;
    if (this.metadataForm.invalid) { this.metadataForm.markAllAsTouched(); return; }

    this.savingMetadata.set(true);
    this.metadataError.set(null);
    this.metadataSaved.set(false);

    const v = this.metadataForm.value;
    const currentClinicalContent = this.doc()?.clinicalContent ?? {};
    const updatedClinicalContent = {
      ...currentClinicalContent,
      titulo: v.title || undefined,
    };

    this.documentService.update(docId, {
      issueDate:  v.issueDate!,
      expiryDate: v.expiryDate || undefined,
      status:     v.status as DocumentStatus || undefined,
      clinicalContent: updatedClinicalContent,
    }).subscribe({
      next: updatedDoc => {
        this.savingMetadata.set(false);
        this.metadataSaved.set(true);
        this.doc.set(updatedDoc);
      },
      error: (err: any) => {
        this.savingMetadata.set(false);
        this.metadataError.set(err.error?.message ?? 'Error al guardar metadatos');
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
      next: (s: OOSession) => {
        this.session.set(s);
        this.editorConfig.set(this.buildConfig(s, false));
        this.opening.set(false);
      },
      error: (err: any) => {
        this.openError.set(err.error?.message ?? 'Error al abrir el editor');
        this.opening.set(false);
      },
    });
  }

  /** Sube el archivo seleccionado y abre el editor con ese archivo. */
  openUploaded(): void {
    if (this.uploadForm.invalid) { this.uploadForm.markAllAsTouched(); return; }
    if (!this.selectedFile()) { this.openError.set('Selecciona un archivo .docx, .xlsx, .pptx o .pdf'); return; }

    this.uploading.set(true);
    this.openError.set(null);

    this.documentService.uploadFile(this.selectedFile()!).subscribe({
      next: ({ url }: { url: string }) => {
        const v = this.uploadForm.value;
        this.documentService.createOnlyofficeSession({
          patientId: v.patientId!,
          issueDate: v.issueDate!,
          title:     v.title || this.selectedFile()!.name.replace(/\.(docx|xlsx|pptx|pdf)$/i, ''),
          fileUrl:   url,
        }).subscribe({
          next: (s: OOSession) => {
            this.session.set(s);
            this.editorConfig.set(this.buildConfig(s, false));
            this.uploading.set(false);
          },
          error: (err: any) => {
            this.openError.set(err.error?.message ?? 'Error al abrir el editor');
            this.uploading.set(false);
          },
        });
      },
      error: (err: any) => {
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
    else if (file.name.endsWith('.pdf')) this.docType.set('PDF');
    else this.docType.set('WORD');
    // Rellenar título si está vacío
    if (!this.uploadForm.value.title) {
      this.uploadForm.patchValue({ title: file.name.replace(/\.(docx|xlsx|pptx|pdf)$/i, '') });
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
        permissions: {
          edit:                 !viewOnly,
          download:             true,
          print:                true,
          fillForms:            !viewOnly,
          comment:              !viewOnly,
          review:               !viewOnly,
          modifyFilter:         !viewOnly,
          modifyContentControl: !viewOnly,
        },
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

  back(): void {
    // Si venimos navegando dentro de la app, vuelve a la página anterior.
    // Si la pestaña arrancó directamente aquí (no hay historial), cae a la lista.
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/documents/list']);
    }
  }

  isLoading(): boolean { return this.opening() || this.uploading(); }
}
