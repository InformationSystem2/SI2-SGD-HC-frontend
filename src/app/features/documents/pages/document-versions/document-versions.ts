import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileLines, faSpinner, faClock, faChevronRight, faEye } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { DocumentVersionHistoryComponent } from '../../components/document-version-history/document-version-history';

@Component({
  selector: 'app-document-versions',
  imports: [FontAwesomeModule, TranslatePipe, DocumentVersionHistoryComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="hc-page-header">
        <h2 class="hc-page-title">
          <fa-icon [icon]="faClock" class="text-hc-primary" />
          Historial de Versiones Inmutables
        </h2>
        <p class="text-sm text-hc-text-3">
          Seleccione un documento clínico para auditar sus cambios y restaurar o visualizar versiones históricas.
        </p>
      </div>

      @if (documentService.error()) {
        <div class="hc-alert-error">{{ documentService.error() }}</div>
      }

      <!-- Layout en 2 columnas: Lista a la izquierda, Timeline a la derecha -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Lista de documentos (4 cols) -->
        <div class="lg:col-span-5 space-y-3">
          <div class="bg-hc-card rounded-xl border border-hc-border shadow-sm p-4">
            <h3 class="text-sm font-semibold text-hc-text-2 mb-3 border-b border-hc-border pb-2">
              Documentos clínicos (OnlyOffice)
            </h3>

            @if (documentService.loading()) {
              <div class="flex justify-center py-8">
                <fa-icon [icon]="faSpinner" class="animate-spin text-hc-primary" />
              </div>
            } @else {
              <div class="divide-y divide-hc-border max-h-[500px] overflow-y-auto pr-1">
                @for (doc of ooDocuments(); track doc.id) {
                  <button type="button" (click)="selectDoc(doc.id)"
                          class="w-full text-left py-3 px-3 rounded-lg transition-all flex items-center justify-between gap-3"
                          [class]="selectedDocId() === doc.id
                            ? 'bg-hc-primary/10 border-l-4 border-hc-primary text-hc-primary shadow-sm'
                            : 'hover:bg-hc-hover text-hc-text-2 border-l-4 border-transparent'">
                    <div class="min-w-0">
                      <p class="text-xs font-semibold uppercase tracking-wider text-hc-text-3 mb-0.5">
                        v{{ doc.versionNumber }} — {{ doc.patientName }}
                      </p>
                      <p class="text-sm font-medium text-hc-text truncate">
                        {{ docTitle(doc) }}
                      </p>
                      <p class="text-[11px] text-hc-text-3 mt-0.5">
                        Emitido: {{ doc.issueDate }}
                      </p>
                    </div>
                    <fa-icon [icon]="faChevronRight" class="text-xs opacity-50 shrink-0" />
                  </button>
                } @empty {
                  <p class="text-xs text-center py-6 text-hc-text-3">
                    No se encontraron documentos OnlyOffice.
                  </p>
                }
              </div>
            }
          </div>
        </div>

        <!-- Timeline de versiones (7 cols) -->
        <div class="lg:col-span-7">
          @if (selectedDocId(); as docId) {
            <app-document-version-history [documentId]="docId"></app-document-version-history>
          } @else {
            <div class="bg-hc-card rounded-xl border border-hc-border border-dashed shadow-sm p-12 text-center text-hc-text-3 flex flex-col items-center justify-center gap-3">
              <fa-icon [icon]="faClock" class="text-4xl text-hc-border" />
              <p class="text-sm font-medium">No se ha seleccionado ningún documento</p>
              <p class="text-xs">Seleccione un documento clínico de la lista de la izquierda para ver su historial de versiones.</p>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentVersionsPage implements OnInit {
  readonly documentService = inject(DocumentService);
  private router = inject(Router);

  readonly faFileLines   = faFileLines;
  readonly faSpinner     = faSpinner;
  readonly faClock       = faClock;
  readonly faChevronRight = faChevronRight;
  readonly faEye         = faEye;

  readonly selectedDocId = signal<string | null>(null);

  readonly ooDocuments = computed(() => {
    return this.documentService.documents().filter(
      doc => doc.isExternalSource || doc.clinicalContent?.['origen'] === 'OnlyOffice'
    );
  });

  ngOnInit(): void {
    this.documentService.getAll().subscribe({
      next: docs => {
        // Seleccionar el primero por defecto si hay alguno
        const list = docs.filter(doc => doc.isExternalSource || doc.clinicalContent?.['origen'] === 'OnlyOffice');
        if (list.length > 0) {
          this.selectedDocId.set(list[0].id);
        }
      }
    });
  }

  docTitle(doc: Document): string {
    const titulo = doc.clinicalContent?.['titulo'];
    if (typeof titulo === 'string' && titulo.trim()) return titulo;
    return doc.templateName || 'Documento clínico';
  }

  selectDoc(id: string): void {
    this.selectedDocId.set(id);
  }
}
