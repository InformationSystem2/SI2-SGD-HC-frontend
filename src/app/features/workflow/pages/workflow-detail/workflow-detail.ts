import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner, faFileLines, faCalendar, faUser, faClock, faCheckCircle,
  faTimesCircle, faBan, faArrowLeft, faHistory, faComment, faPaperPlane,
  faCheck, faXmark, faCircleInfo, faComments, faPen,
  faCircleCheck, faCircleXmark, faRotateLeft, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { WorkflowService } from '../../services/workflow.service';
import { ReviewTaskService } from '../../services/review-task.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Workflow, WorkflowStatus, WorkflowEvent, WorkflowComment, ReviewTask, ReviewTaskOutcome, WorkflowTaskDto } from '../../models/workflow.model';
import { UserService } from '../../../users/services/user.service';
import { DocumentService } from '../../../documents/services/document.service';
import { VersionHistoryResponseDto } from '../../../documents/models/document.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-workflow-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslatePipe, TranslateModule, RouterModule],
  templateUrl: './workflow-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowDetailPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workflowService = inject(WorkflowService);
  private reviewTaskService = inject(ReviewTaskService);
  readonly auth = inject(AuthService);
  private userService = inject(UserService);

  readonly faSpinner   = faSpinner;
  readonly faFileLines = faFileLines;
  readonly faCalendar  = faCalendar;
  readonly faUser      = faUser;
  readonly faClock     = faClock;
  readonly faCheck     = faCheckCircle;
  readonly faTimes     = faTimesCircle;
  readonly faBan       = faBan;
  readonly faArrowLeft = faArrowLeft;
  readonly faHistory   = faHistory;
  readonly faComment   = faComment;
  readonly faPaperPlane = faPaperPlane;
  readonly faCheckSm   = faCheck;
  readonly faXmarkSm   = faXmark;
  readonly faComments  = faComments;
  readonly faCircleInfo = faCircleInfo;
  readonly faPen       = faPen;

  readonly workflow = this.workflowService.selectedWorkflow;
  readonly loading = this.workflowService.loading;
  readonly error = this.workflowService.error;

  readonly activeTab = signal<'tasks' | 'history' | 'comments'>('tasks');
  
  // Data for tabs
  readonly events = signal<WorkflowEvent[]>([]);
  readonly comments = signal<WorkflowComment[]>([]);
  readonly eventsLoading = signal(false);
  readonly commentsLoading = signal(false);

  // Complete task modal
  readonly showCompleteModal = signal(false);
  readonly taskToComplete = signal<WorkflowTaskDto | ReviewTask | null>(null);
  readonly completeOutcome = signal<ReviewTaskOutcome | ''>('');
  readonly completeComment = signal('');
  readonly actionLoading = signal(false);
  readonly actionError = signal<string | null>(null);

  // Resubmit modal
  readonly resubmitDocId = signal<string | null>(null);
  readonly resubmitAssigneeId = signal('');
  readonly resubmitLoading = signal(false);
  readonly resubmitVersions = signal<VersionHistoryResponseDto[]>([]);
  readonly resubmitVersionsLoading = signal(false);
  readonly resubmitSelectedVersion = signal<number | null>(null);
  readonly resubmitRejectedVersion = signal<number | null>(null);
  private documentService = inject(DocumentService);

  readonly users = computed(() => {
    const me = this.auth.username();
    return this.userService.users().filter(u => u.username !== me);
  });

  readonly isCreator = computed(() => {
    const wf = this.workflow();
    if (!wf) return false;
    return wf.creatorUsername === this.auth.username();
  });

  // New comment
  readonly newComment = signal('');
  readonly commentSubmitting = signal(false);

  private workflowId = '';

  ngOnInit(): void {
    this.workflowId = this.route.snapshot.paramMap.get('id') || '';
    if (this.workflowId) {
      this.loadData();
      this.userService.getUsers().subscribe();
    }
  }

  private loadData() {
    this.workflowService.getWorkflow(this.workflowId).subscribe();
    this.loadHistory();
    this.loadComments();
    this.reviewTaskService.getMyTasks().subscribe();
  }

  private loadHistory() {
    this.eventsLoading.set(true);
    this.workflowService.getWorkflowHistory(this.workflowId).subscribe({
      next: ev => { this.events.set(ev); this.eventsLoading.set(false); },
      error: () => this.eventsLoading.set(false)
    });
  }

  private loadComments() {
    this.commentsLoading.set(true);
    this.workflowService.getWorkflowComments(this.workflowId).subscribe({
      next: c => { this.comments.set(c); this.commentsLoading.set(false); },
      error: () => this.commentsLoading.set(false)
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }

  viewDocument(docId: string) {
    this.router.navigate(['/documents/view', docId]);
  }

  cancelWorkflow() {
    const wf = this.workflow();
    if (!wf) return;
    if (!confirm('¿Está seguro de cancelar este flujo de trabajo?')) return;

    this.workflowService.cancelWorkflow(wf.id).subscribe({
      next: () => this.loadData(),
    });
  }

  openResubmitModal(docId: string) {
    this.resubmitDocId.set(docId);
    this.resubmitAssigneeId.set('');
    this.resubmitSelectedVersion.set(null);
    this.resubmitVersions.set([]);
    this.resubmitVersionsLoading.set(true);

    const wf = this.workflow();
    if (wf) {
      const task = [...wf.tasks].reverse().find(t => t.documentId === docId && t.status === 'COMPLETED' && t.outcome === 'REJECTED');
      this.resubmitRejectedVersion.set(task?.documentVersion ?? null);
    } else {
      this.resubmitRejectedVersion.set(null);
    }

    this.documentService.getVersions(docId).subscribe({
      next: (versions: VersionHistoryResponseDto[]) => {
        this.resubmitVersions.set(versions);
        const currentVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
        this.resubmitSelectedVersion.set(currentVersionNumber);
        this.resubmitVersionsLoading.set(false);
      },
      error: () => {
        this.resubmitVersionsLoading.set(false);
      }
    });
  }

  closeResubmitModal() {
    this.resubmitDocId.set(null);
  }

  confirmResubmit() {
    const docId = this.resubmitDocId();
    const wf = this.workflow();
    const selectedVersion = this.resubmitSelectedVersion();
    if (!wf || !docId || selectedVersion === null) return;

    this.resubmitLoading.set(true);
    this.workflowService.resubmitDocument(wf.id, docId, selectedVersion, this.resubmitAssigneeId() || undefined).subscribe({
      next: () => {
        this.resubmitDocId.set(null);
        this.resubmitLoading.set(false);
        this.loadData();
      },
      error: (err) => {
        alert(err.error?.message ?? 'Error al reenviar documento');
        this.resubmitLoading.set(false);
      }
    });
  }

  canClaimOrComplete(taskId: string): boolean {
    if (!this.auth.hasPermission('review-task:update')) return false;
    const myTasks = this.reviewTaskService.myTasks();
    return myTasks.some(t => t.id === taskId);
  }

  claimTask(taskId: string) {
    this.actionLoading.set(true);
    this.reviewTaskService.claimTask(taskId).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadData();
      },
      error: () => this.actionLoading.set(false)
    });
  }

  openCompleteModal(task: WorkflowTaskDto | ReviewTask, outcome: ReviewTaskOutcome): void {
    this.taskToComplete.set(task);
    this.completeOutcome.set(outcome);
    this.completeComment.set('');
    this.actionError.set(null);
    this.showCompleteModal.set(true);
  }

  submitCompleteTask(): void {
    const task = this.taskToComplete();
    const outcome = this.completeOutcome() as ReviewTaskOutcome;
    if (!task || !outcome) return;
    if (outcome === 'REJECTED' && !this.completeComment().trim()) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.reviewTaskService.completeTask(task.id, {
      outcome,
      comment: this.completeComment().trim() || undefined,
    }).subscribe({
      next: () => {
        this.showCompleteModal.set(false);
        this.actionLoading.set(false);
        this.loadData();
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al completar la tarea');
        this.actionLoading.set(false);
      },
    });
  }

  submitComment(): void {
    const text = this.newComment().trim();
    if (!text) return;
    this.commentSubmitting.set(true);
    this.workflowService.addComment({ commentText: text, workflowId: this.workflowId }).subscribe({
      next: comment => {
        this.comments.update(list => [...list, comment]);
        this.newComment.set('');
        this.commentSubmitting.set(false);
      },
      error: () => this.commentSubmitting.set(false),
    });
  }

  statusClass(status: WorkflowStatus): string {
    switch (status) {
      case 'ACTIVE':    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-hc-muted text-hc-text-3';
      default:          return 'bg-hc-muted text-hc-text-3';
    }
  }

  priorityLabel(p: number): string {
    switch (p) {
      case 1: return 'Alta';
      case 2: return 'Media';
      default: return 'Normal';
    }
  }

  priorityClass(p: number): string {
    switch (p) {
      case 1: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 2: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-hc-muted text-hc-text-3';
    }
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
      DOCUMENT_CREATED:   'Workflow iniciado',
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
