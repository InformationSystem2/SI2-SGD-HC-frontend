import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faFileLines, faSpinner, faBookOpen,
  faMagnifyingGlass, faRotateRight, faEdit,
  faPaperPlane, faCheck, faXmark, faPen, faUsers,
  faClock, faComments, faCircleCheck, faCircleXmark,
  faCircleInfo, faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { DocumentService } from '../../services/document.service';
import { OcrService, OcrResult } from '../../services/ocr.service';
import { Document } from '../../models/document.model';
import { ReviewTaskService } from '../../../workflow/services/review-task.service';
import { WorkflowService } from '../../../workflow/services/workflow.service';
import { ReviewTask, ReviewTaskOutcome, WorkflowEvent, WorkflowComment } from '../../../workflow/models/workflow.model';
import { UserService } from '../../../users/services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentVersionHistoryComponent } from '../../components/document-version-history/document-version-history';

@Component({
  selector: 'app-document-detail',
  imports: [FontAwesomeModule, TranslatePipe, DocumentVersionHistoryComponent],
  templateUrl: './document-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDetail implements OnInit {

  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private docSvc  = inject(DocumentService);
  private ocrSvc  = inject(OcrService);
  private taskSvc = inject(ReviewTaskService);
  private wfSvc   = inject(WorkflowService);
  readonly userSvc = inject(UserService);
  readonly auth    = inject(AuthService);

  // ── Icons ────────────────────────────────────────────────────────
  readonly faArrowLeft       = faArrowLeft;
  readonly faFileLines       = faFileLines;
  readonly faSpinner         = faSpinner;
  readonly faBookOpen        = faBookOpen;
  readonly faExpand          = faMagnifyingGlass;
  readonly faRotateRight     = faRotateRight;
  readonly faEdit            = faEdit;
  readonly faPaperPlane      = faPaperPlane;
  readonly faCheck           = faCheck;
  readonly faXmark           = faXmark;
  readonly faPen             = faPen;
  readonly faUsers           = faUsers;
  readonly faClock           = faClock;
  readonly faComments        = faComments;
  readonly faCircleCheck     = faCircleCheck;
  readonly faCircleXmark     = faCircleXmark;
  readonly faCircleInfo      = faCircleInfo;
  readonly faRotateLeft      = faRotateLeft;

  // ── Document state ───────────────────────────────────────────────
  readonly doc     = signal<Document | null>(null);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);

  // ── OCR state ────────────────────────────────────────────────────
  readonly ocrResult  = signal<OcrResult | null>(null);
  readonly ocrLoading = signal(false);
  readonly ocrError   = signal<string | null>(null);
  imgError = false;

  // ── Workflow state ───────────────────────────────────────────────
  private docId = '';
  readonly docTasks       = signal<ReviewTask[]>([]);
  readonly events         = signal<WorkflowEvent[]>([]);
  readonly comments       = signal<WorkflowComment[]>([]);
  readonly wfLoading      = signal(false);
  readonly actionLoading  = signal(false);
  readonly actionError    = signal<string | null>(null);

  // Task assigned to current user for this document
  readonly myTask = computed(() =>
    this.taskSvc.myTasks().find(t => t.documentId === this.docId) ?? null
  );

  // ── Workflow permissions ─────────────────────────────────────────
  readonly canSendToReview  = computed(() =>
    this.doc()?.status === 'DRAFT' && this.auth.hasPermission('review-task:create')
  );
  readonly canClaimOrComplete = computed(() =>
    this.doc()?.status === 'PENDING_REVIEW' && this.auth.hasPermission('review-task:update')
  );
  readonly canCorrect = computed(() =>
    this.doc()?.status === 'REJECTED' && this.auth.hasPermission('document:update:status')
  );
  readonly canSeeWorkflow = computed(() =>
    this.auth.hasPermission('workflow:read') || this.auth.hasPermission('review-task:read')
  );

  // ── Send-to-review modal state ───────────────────────────────────
  readonly showSendModal       = signal(false);
  readonly selectedReviewerIds = signal(new Set<string>());
  readonly sendPriority        = signal(3);
  readonly sendDueDate         = signal('');

  // ── Complete-task modal state ────────────────────────────────────
  readonly showCompleteModal = signal(false);
  readonly taskToComplete    = signal<ReviewTask | null>(null);
  readonly completeOutcome   = signal<ReviewTaskOutcome | ''>('');
  readonly completeComment   = signal('');

  // ── New comment state ────────────────────────────────────────────
  readonly newComment        = signal('');
  readonly commentSubmitting = signal(false);

  // ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.docId = this.route.snapshot.paramMap.get('id')!;
    this.docSvc.getById(this.docId).subscribe({
      next: d => {
        this.doc.set(d);
        this.loading.set(false);
        if (d.fileUrl) this.loadOcr(d.id);
        this.loadWorkflowData();
      },
      error: e => {
        this.error.set(e.error?.message ?? 'Error al cargar el documento');
        this.loading.set(false);
      },
    });
  }

  private loadWorkflowData(): void {
    this.wfLoading.set(true);
    if (this.auth.hasPermission('workflow:read')) {
      this.wfSvc.getDocumentHistory(this.docId).subscribe({
        next: ev => this.events.set(ev),
      });
      this.wfSvc.getDocumentComments(this.docId).subscribe({
        next: c => this.comments.set(c),
      });
    }
    if (this.auth.hasPermission('review-task:read')) {
      this.taskSvc.getByDocument(this.docId).subscribe({
        next: tasks => { this.docTasks.set(tasks); this.wfLoading.set(false); },
        error: () => this.wfLoading.set(false),
      });
      this.taskSvc.getMyTasks().subscribe();
    } else {
      this.wfLoading.set(false);
    }
  }

  // ── Send to review ───────────────────────────────────────────────

  openSendModal(): void {
    this.selectedReviewerIds.set(new Set());
    this.sendPriority.set(3);
    this.sendDueDate.set('');
    this.actionError.set(null);
    if (!this.userSvc.users().length) {
      this.userSvc.getUsers().subscribe();
    }
    this.showSendModal.set(true);
  }

  toggleReviewer(id: string): void {
    this.selectedReviewerIds.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  submitSendReview(): void {
    const reviewerIds = [...this.selectedReviewerIds()];
    if (!reviewerIds.length) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.taskSvc.startReview({
      documentId: this.docId,
      reviewerIds,
      priority: this.sendPriority(),
      dueDate: this.sendDueDate() || undefined,
    }).subscribe({
      next: tasks => {
        this.docTasks.set(tasks);
        this.showSendModal.set(false);
        this.actionLoading.set(false);
        this.docSvc.getById(this.docId).subscribe({ next: d => this.doc.set(d) });
        this.loadWorkflowData();
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al enviar a revisión');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Claim task ───────────────────────────────────────────────────

  claimTask(taskId: string): void {
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.taskSvc.claimTask(taskId).subscribe({
      next: updated => {
        this.docTasks.update(list => list.map(t => t.id === taskId ? updated : t));
        this.taskSvc.getMyTasks().subscribe();
        this.actionLoading.set(false);
        this.wfSvc.getDocumentHistory(this.docId).subscribe({ next: ev => this.events.set(ev) });
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al reclamar la tarea');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Complete task ────────────────────────────────────────────────

  openCompleteModal(task: ReviewTask, outcome: ReviewTaskOutcome): void {
    this.taskToComplete.set(task);
    this.completeOutcome.set(outcome);
    this.completeComment.set('');
    this.actionError.set(null);
    this.showCompleteModal.set(true);
  }

  submitCompleteTask(): void {
    const task    = this.taskToComplete();
    const outcome = this.completeOutcome() as ReviewTaskOutcome;
    if (!task || !outcome) return;
    if (outcome === 'REJECTED' && !this.completeComment().trim()) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.taskSvc.completeTask(task.id, {
      outcome,
      comment: this.completeComment().trim() || undefined,
    }).subscribe({
      next: () => {
        this.showCompleteModal.set(false);
        this.actionLoading.set(false);
        this.docSvc.getById(this.docId).subscribe({ next: d => this.doc.set(d) });
        this.loadWorkflowData();
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al completar la tarea');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Correct (REJECTED → DRAFT) ──────────────────────────────────

  correct(): void {
    if (!confirm('¿Corregir el documento y devolverlo a borrador?')) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.docSvc.changeStatus(this.docId, 'DRAFT').subscribe({
      next: updated => {
        this.doc.set(updated);
        this.actionLoading.set(false);
        this.loadWorkflowData();
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al corregir el documento');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Comments ─────────────────────────────────────────────────────

  submitComment(): void {
    const text = this.newComment().trim();
    if (!text) return;
    this.commentSubmitting.set(true);
    this.wfSvc.addComment(this.docId, { commentText: text }).subscribe({
      next: comment => {
        this.comments.update(list => [...list, comment]);
        this.newComment.set('');
        this.commentSubmitting.set(false);
      },
      error: () => this.commentSubmitting.set(false),
    });
  }

  // ── Workflow display helpers ─────────────────────────────────────

  taskStatusLabel(status: string): string {
    return ({ PENDING: 'Pendiente', IN_PROGRESS: 'En progreso', COMPLETED: 'Completado', CANCELLED: 'Cancelado' } as Record<string, string>)[status] ?? status;
  }

  taskStatusClass(status: string): string {
    return ({
      PENDING:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      IN_PROGRESS: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
      COMPLETED:   'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
      CANCELLED:   'bg-hc-muted   text-hc-text-3',
    } as Record<string, string>)[status] ?? 'bg-hc-muted text-hc-text-2';
  }

  priorityLabel(p: number): string {
    return ({ 1: 'Alta', 2: 'Media', 3: 'Normal' } as Record<number, string>)[p] ?? 'Normal';
  }

  priorityClass(p: number): string {
    return ({
      1: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
      2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      3: 'bg-hc-muted   text-hc-text-2',
    } as Record<number, string>)[p] ?? 'bg-hc-muted text-hc-text-2';
  }

  eventIcon(eventType: string): any {
    return ({
      DOCUMENT_CREATED:   faFileLines,
      SENT_TO_REVIEW:     faPaperPlane,
      TASK_ASSIGNED:      faUsers,
      TASK_CLAIMED:       faPen,
      TASK_APPROVED:      faCircleCheck,
      TASK_REJECTED:      faCircleXmark,
      TASK_CANCELLED:     faXmark,
      TASK_OVERDUE:       faCircleInfo,
      DOCUMENT_FINALIZED: faCircleCheck,
      DOCUMENT_REJECTED:  faCircleXmark,
      DOCUMENT_CORRECTED: faRotateLeft,
      COMMENT_ADDED:      faComments,
    } as Record<string, any>)[eventType] ?? faCircleInfo;
  }

  eventIconClass(eventType: string): string {
    return ({
      DOCUMENT_CREATED:   'text-blue-500',
      SENT_TO_REVIEW:     'text-blue-500',
      TASK_ASSIGNED:      'text-blue-500',
      TASK_CLAIMED:       'text-amber-500',
      TASK_APPROVED:      'text-green-600',
      TASK_REJECTED:      'text-red-600',
      TASK_CANCELLED:     'text-hc-text-3',
      TASK_OVERDUE:       'text-red-600',
      DOCUMENT_FINALIZED: 'text-green-600',
      DOCUMENT_REJECTED:  'text-red-600',
      DOCUMENT_CORRECTED: 'text-amber-500',
      COMMENT_ADDED:      'text-hc-text-3',
    } as Record<string, string>)[eventType] ?? 'text-hc-text-3';
  }

  eventLabel(eventType: string): string {
    return ({
      DOCUMENT_CREATED:   'Documento creado',
      SENT_TO_REVIEW:     'Enviado a revisión',
      TASK_ASSIGNED:      'Tarea asignada',
      TASK_CLAIMED:       'Tarea reclamada',
      TASK_APPROVED:      'Aprobado',
      TASK_REJECTED:      'Rechazado',
      TASK_CANCELLED:     'Tarea cancelada',
      TASK_OVERDUE:       'Tarea vencida',
      DOCUMENT_FINALIZED: 'Documento finalizado',
      DOCUMENT_REJECTED:  'Documento rechazado',
      DOCUMENT_CORRECTED: 'En corrección',
      COMMENT_ADDED:      'Comentario agregado',
    } as Record<string, string>)[eventType] ?? eventType;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ── Existing helpers (unchanged) ─────────────────────────────────

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
    this.router.navigate(['/documentos/editor'], {
      queryParams: { docId: this.doc()!.id, mode: 'view' },
    });
  }

  edit(): void {
    this.router.navigate(['/documentos/editor'], { queryParams: { docId: this.doc()!.id } });
  }

  objectKeys(obj: any): string[] { return obj ? Object.keys(obj) : []; }

  datosKeys(obj: any): string[] {
    return Object.keys(obj).filter(k => k !== 'tipo_documento');
  }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  back(): void { this.router.navigate(['/documentos/list']); }
}
