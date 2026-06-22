import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  History,
  FileEdit,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Eye,
  FileSearch,
  LucideIconData,
} from 'lucide-angular';
import { DocumentStatus } from '../../models/document.model';
import { DocumentVersionService } from '../../services/document-version.service';

/**
 * Línea de tiempo vertical, de solo lectura, con el historial inmutable de
 * versiones de un documento.
 */
@Component({
  selector: 'app-document-version-history',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, SlicePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hc-card p-4">
      <header class="flex items-center gap-2 border-b border-hc-border pb-3">
        <lucide-angular [img]="History" [size]="18" class="text-hc-primary"/>
        <h3 class="text-base font-semibold text-hc-text">
          Historial de versiones
        </h3>
        <span class="ml-auto text-xs text-hc-text-3">
          {{ history().length }} versiones guardadas
        </span>
      </header>

      @if (loading()) {
        <p class="py-6 text-center text-sm text-hc-text-3">
          Cargando versiones...
        </p>
      } @else if (error()) {
        <p class="py-6 text-center text-sm text-red-500">{{ error() }}</p>
      } @else if (history().length === 0) {
        <p class="py-6 text-center text-sm text-hc-text-3">
          No hay versiones previas de este documento.
        </p>
      } @else {
        <ol class="relative mt-4 ml-3 border-l-2 border-hc-border">
          @for (v of history(); track v.id) {
            <li class="mb-6 ml-6">
              <span class="absolute -left-3 flex h-6 w-6 items-center justify-center
                           rounded-full ring-4 ring-hc-card"
                    [class]="dotBg(v.status)">
                <lucide-angular [img]="iconFor(v.status)" [size]="12" class="text-white"/>
              </span>

              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span class="text-sm font-semibold text-hc-text">
                  Versión v{{ v.versionNumber }}
                </span>
                <span [class]="badgeClass(v.status)">
                  {{ v.status }}
                </span>
                <time class="ml-auto text-xs text-hc-text-3">
                  {{ v.createdAt | date:'medium' }}
                </time>
              </div>

              <p class="mt-1 flex items-center gap-1 text-xs text-hc-text-2">
                <lucide-angular [img]="User" [size]="12"/>
                <span class="font-mono">{{ v.authorId | slice:0:8 }}…</span>
              </p>

              <p class="mt-2 rounded-md bg-hc-muted p-2 text-sm text-hc-text">
                <span class="font-medium">Detalle del guardado:</span>
                {{ v.changeReason }}
              </p>

              <div class="mt-2 flex flex-wrap items-center gap-3">
                <button type="button"
                        class="inline-flex items-center gap-1 text-xs
                                text-hc-primary hover:underline"
                        (click)="toggle(v.id)">
                  <lucide-angular [img]="isOpen(v.id) ? ChevronDown : ChevronRight" [size]="12"/>
                  <lucide-angular [img]="Eye" [size]="12"/>
                  {{ (isOpen(v.id) ? 'Ocultar campos' : 'Ver campos') }}
                </button>

                @if (v.fileUrl) {
                  <a [routerLink]="['/documents/editor']"
                     [queryParams]="{ docId: documentId(), versionId: v.id, mode: 'view' }"
                     class="inline-flex items-center gap-1 rounded border border-hc-border
                            px-2 py-0.5 text-xs text-hc-primary hover:bg-hc-muted">
                    <lucide-angular [img]="FileSearch" [size]="12"/>
                    Abrir versión OnlyOffice
                  </a>
                }
              </div>

              @if (isOpen(v.id)) {
                @let entries = contentEntries(v.clinicalContent);
                <div class="mt-2 rounded-md border border-hc-border bg-hc-card p-3">
                  @if (entries.length === 0) {
                    <p class="text-xs italic text-hc-text-3">
                      Sin contenido registrado.
                    </p>
                  } @else {
                    <dl class="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                      @for (e of entries; track e.key) {
                        <div class="flex flex-col">
                          <dt class="text-[11px] font-medium uppercase text-hc-text-3">
                            {{ e.key }}
                          </dt>
                          <dd class="break-words text-hc-text">
                            {{ e.value }}
                          </dd>
                        </div>
                      }
                    </dl>
                  }
                  <details class="mt-3">
                    <summary class="cursor-pointer text-[11px] text-hc-text-3 hover:text-hc-text-2">
                      Ver JSON original
                    </summary>
                    <pre class="mt-2 max-h-64 overflow-auto rounded bg-hc-muted p-2 text-[11px]
                                text-hc-text">{{ asJson(v.clinicalContent) }}</pre>
                  </details>
                </div>
              }
            </li>
          }
        </ol>
      }
    </section>
  `,
})
export class DocumentVersionHistoryComponent {
  readonly documentId = input.required<string>();

  private readonly workflow = inject(DocumentVersionService);
  readonly history = this.workflow.history;
  readonly loading = this.workflow.loading;
  readonly error   = this.workflow.error;

  // Iconos
  protected readonly History       = History;
  protected readonly User          = User;
  protected readonly ChevronDown   = ChevronDown;
  protected readonly ChevronRight  = ChevronRight;
  protected readonly Eye           = Eye;
  protected readonly FileSearch    = FileSearch;

  /** IDs de versiones expandidas en el timeline. */
  private readonly expanded = signal<Set<string>>(new Set());

  protected isOpen(id: string): boolean {
    return this.expanded().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.expanded());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded.set(next);
  }

  /** Aplana el JSONB a pares clave–valor mostrables. */
  protected contentEntries(content: Record<string, unknown> | null | undefined)
      : Array<{ key: string; value: string }> {
    if (!content) return [];
    return Object.entries(content).map(([key, value]) => ({
      key,
      value: this.formatValue(value),
    }));
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  protected asJson(content: Record<string, unknown> | null | undefined): string {
    return JSON.stringify(content ?? {}, null, 2);
  }

  constructor() {
    effect(() => {
      const id = this.documentId();
      if (id) this.workflow.loadHistory(id).subscribe();
    });
  }

  protected iconFor(status: DocumentStatus): LucideIconData {
    switch (status) {
      case 'DRAFT':          return FileEdit;
      case 'PENDING_REVIEW': return Send;
      case 'REJECTED':       return XCircle;
      case 'FINALIZED':      return CheckCircle2;
      default:               return FileText;
    }
  }

  protected dotBg(status: DocumentStatus): string {
    switch (status) {
      case 'DRAFT':          return 'bg-zinc-500';
      case 'PENDING_REVIEW': return 'bg-amber-500';
      case 'REJECTED':       return 'bg-red-500';
      case 'FINALIZED':      return 'bg-emerald-600';
      default: return 'bg-zinc-500';
    }
  }

  protected badgeClass(status: DocumentStatus): string {
    switch (status) {
      case 'DRAFT':          return 'hc-badge-muted';
      case 'PENDING_REVIEW': return 'hc-badge-warning';
      case 'REJECTED':       return 'hc-badge-danger';
      case 'FINALIZED':      return 'hc-badge-success';
      default: return 'hc-badge-muted';
    }
  }
}
