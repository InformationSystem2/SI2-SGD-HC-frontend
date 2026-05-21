import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faFileLines, faSpinner, faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-detail',
  imports: [FontAwesomeModule],
  templateUrl: './document-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDetail implements OnInit {

  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private docSvc  = inject(DocumentService);

  readonly faArrowLeft = faArrowLeft;
  readonly faFileLines = faFileLines;
  readonly faSpinner   = faSpinner;
  readonly faBookOpen  = faBookOpen;

  readonly doc     = signal<Document | null>(null);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.docSvc.getById(id).subscribe({
      next: d  => { this.doc.set(d); this.loading.set(false); },
      error: e => { this.error.set(e.error?.message ?? 'Error al cargar el documento'); this.loading.set(false); },
    });
  }

  docTitle(): string {
    const d = this.doc();
    if (!d) return '';
    const t = d.clinicalContent?.['titulo'];
    return typeof t === 'string' && t.trim() ? t : d.templateName;
  }

  contentEntries(): { key: string; value: string }[] {
    const content = this.doc()?.clinicalContent ?? {};
    return Object.entries(content).map(([key, value]) => ({
      key:   key.replace(/_/g, ' '),
      value: String(value),
    }));
  }

  statusLabel(status: string): string {
    return { DRAFT: 'Borrador', PENDING_SIGNATURE: 'Pendiente de firma', COMPLETED: 'Completado' }[status] ?? status;
  }

  statusClass(status: string): string {
    return {
      DRAFT:             'bg-yellow-100 text-yellow-700',
      PENDING_SIGNATURE: 'bg-blue-100 text-blue-700',
      COMPLETED:         'bg-green-100 text-green-700',
    }[status] ?? 'bg-hc-muted text-hc-text-2';
  }

  openInViewer(): void {
    this.router.navigate(['/documentos/editor'], {
      queryParams: { docId: this.doc()!.id, mode: 'view' },
    });
  }

  back(): void {
    this.router.navigate(['/documentos/list']);
  }
}
