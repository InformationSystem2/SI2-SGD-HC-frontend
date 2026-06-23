import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faFileLines, faSpinner, faBookOpen,
  faMagnifyingGlass, faRotateRight, faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { DocumentService } from '../../services/document.service';
import { OcrService, OcrResult } from '../../services/ocr.service';
import { Document } from '../../models/document.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentVersionHistoryComponent } from '../../components/document-version-history/document-version-history';

@Component({
  selector: 'app-document-detail',
  imports: [FontAwesomeModule, TranslatePipe, DocumentVersionHistoryComponent, RouterLink],
  templateUrl: './document-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDetail implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private docSvc = inject(DocumentService);
  private ocrSvc = inject(OcrService);
  readonly auth = inject(AuthService);

  readonly faArrowLeft   = faArrowLeft;
  readonly faFileLines   = faFileLines;
  readonly faSpinner     = faSpinner;
  readonly faBookOpen    = faBookOpen;
  readonly faExpand        = faMagnifyingGlass;   // faScan no existe en FA free
  readonly faRotateRight = faRotateRight;
  readonly faEdit        = faEdit;

  readonly doc     = signal<Document | null>(null);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);

  // ── OCR state ────────────────────────────────────────────────────
  readonly ocrResult  = signal<OcrResult | null>(null);
  readonly ocrLoading = signal(false);
  readonly ocrError   = signal<string | null>(null);
  imgError = false;

  ngOnInit(): void {
    const docId = this.route.snapshot.paramMap.get('id')!;
    this.docSvc.getById(docId).subscribe({
      next: d => {
        this.doc.set(d);
        this.loading.set(false);
        if (d.fileUrl) this.loadOcr(d.id);
      },
      error: e => {
        this.error.set(e.error?.message ?? 'Error al cargar el documento');
        this.loading.set(false);
      },
    });
  }

  private loadOcr(docId: string): void {
    this.ocrSvc.getOcr(docId).subscribe({
      next:  r => this.ocrResult.set(r),
      error: () => this.ocrResult.set(null),
    });
  }

  processOcr(): void {
    const id = this.doc()?.id;
    if (!id) return;
    this.ocrLoading.set(true);
    this.ocrError.set(null);
    this.ocrSvc.triggerOcr(id).subscribe({
      next:  r => { this.ocrResult.set(r); this.ocrLoading.set(false); },
      error: e => { this.ocrError.set(e.error?.message ?? 'Error al procesar OCR'); this.ocrLoading.set(false); },
    });
  }

  fileFullUrl(fileUrl: string): string {
    const baseUrl = environment.apiUrl.split('/api')[0];
    return `${baseUrl}${fileUrl}`;
  }

  isImage(fileUrl: string): boolean {
    const ext = fileUrl.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(ext);
  }

  confidenceLabel(): string {
    const s = this.ocrResult()?.confidence_score ?? 0;
    if (s >= 0.75) return 'Alta';
    if (s >= 0.45) return 'Media';
    return 'Baja';
  }

  confidenceClass(): string {
    const s = this.ocrResult()?.confidence_score ?? 0;
    if (s >= 0.75) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (s >= 0.45) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }

  confidencePercent(): string {
    return Math.round((this.ocrResult()?.confidence_score ?? 0) * 100) + '%';
  }

  docTitle(): string {
    const d = this.doc();
    if (!d) return '';
    const t = d.clinicalContent?.['titulo'];
    return typeof t === 'string' && t.trim() ? t : d.templateName;
  }

  contentEntries(): { key: string; value: any; isArray: boolean }[] {
    const content = this.doc()?.clinicalContent ?? {};
    return Object.entries(content).map(([key, value]) => ({
      key:     key.replace(/_/g, ' '),
      value,
      isArray: Array.isArray(value),
    }));
  }

  getArrayHeaders(arr: any[]): string[] {
    if (!arr || arr.length === 0) return [];
    return Object.keys(arr[0]);
  }

  isBoolean(val: any): boolean { return typeof val === 'boolean'; }

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
      DRAFT:          'bg-yellow-100 text-yellow-700',
      PENDING_REVIEW: 'bg-blue-100   text-blue-700',
      REJECTED:       'bg-red-100    text-red-700',
      FINALIZED:      'bg-green-100  text-green-700',
    } as Record<string, string>)[status] ?? 'bg-hc-muted text-hc-text-2';
  }

  openInViewer(): void {
    this.router.navigate(['/documents/editor'], {
      queryParams: { docId: this.doc()!.id, mode: 'view' },
    });
  }

  edit(): void {
    this.router.navigate(['/documents/editor'], { queryParams: { docId: this.doc()!.id } });
  }

  objectKeys(obj: any): string[] { return obj ? Object.keys(obj) : []; }

  datosKeys(obj: any): string[] {
    return Object.keys(obj).filter(k => k !== 'tipo_documento');
  }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  back(): void { this.router.navigate(['/documents/list']); }
}
