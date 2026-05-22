import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileLines, faSpinner, faUpload, faEye, faEdit, faTrash, faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './document-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentList implements OnInit {

  readonly documentService = inject(DocumentService);
  private router = inject(Router);
  private translate = inject(TranslateService);  

  readonly faFileLines = faFileLines;
  readonly faSpinner   = faSpinner;
  readonly faUpload    = faUpload;
  readonly faEye       = faEye;
  readonly faEdit      = faEdit;
  readonly faTrash     = faTrash;
  readonly faBookOpen  = faBookOpen;

  readonly deletingId = signal<string | null>(null);

  readonly PAGE_SIZE   = 20;
  readonly page        = signal(0);
  readonly totalItems  = computed(() => this.documentService.documents().length);
  readonly totalPages  = computed(() => Math.ceil(this.totalItems() / this.PAGE_SIZE) || 1);
  readonly paged       = computed(() => {
    const s = this.page() * this.PAGE_SIZE;
    return this.documentService.documents().slice(s, s + this.PAGE_SIZE);
  });
  readonly visiblePages = computed(() => {
    const total = this.totalPages(), cur = this.page();
    const start = Math.max(0, Math.min(cur - 2, total - 5));
    const end   = Math.min(total - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  prevPage()        { this.page.update(p => Math.max(0, p - 1)); }
  nextPage()        { this.page.update(p => Math.min(this.totalPages() - 1, p + 1)); }
  goToPage(n: number) { this.page.set(n); }

  ngOnInit(): void {
    this.documentService.getAll().subscribe();
  }

  docTitle(doc: { templateName: string; clinicalContent: Record<string, unknown> }): string {
    const titulo = doc.clinicalContent?.['titulo'];
    if (typeof titulo === 'string' && titulo.trim()) return titulo;
    return doc.templateName;
  }

  goToUpload(): void {
    this.router.navigate(['/documentos/upload']);
  }

  /** Abre el documento en OnlyOffice en modo SOLO LECTURA. */
  openInViewer(id: string): void {
    this.router.navigate(['/documentos/editor'], { queryParams: { docId: id, mode: 'view' } });
  }

  view(id: string): void {
    this.router.navigate(['/documentos/view', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/documentos/edit', id]);
  }

  delete(id: string): void {
    const msg = this.translate.instant('DOCUMENT_LIST.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.deletingId.set(id);
    this.documentService.delete(id).subscribe({
      complete: () => this.deletingId.set(null),
      error:    () => this.deletingId.set(null),
    });
  }

  statusClass(status: string): string {
    return {
      DRAFT:              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PENDING_SIGNATURE:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
      COMPLETED:          'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    }[status] ?? 'bg-hc-muted text-hc-text-2';
  }

  statusLabel(status: string): string {
    return {
      DRAFT:             this.translate.instant('DOCUMENT_LIST.STATUS_DRAFT'),
      PENDING_SIGNATURE: this.translate.instant('DOCUMENT_LIST.STATUS_PENDING'),
      COMPLETED:         this.translate.instant('DOCUMENT_LIST.STATUS_COMPLETED'),
    }[status] ?? status;
  }
}
