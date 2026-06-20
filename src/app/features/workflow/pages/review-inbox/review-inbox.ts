import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInbox, faSpinner, faRotateRight, faPen, faCheck, faXmark,
  faEye, faCircleCheck, faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { ReviewTaskService } from '../../services/review-task.service';
import { ReviewTask, ReviewTaskOutcome } from '../../models/workflow.model';

type TabKey = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-review-inbox',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './review-inbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewInbox implements OnInit {

  private taskSvc = inject(ReviewTaskService);
  private router  = inject(Router);

  readonly faInbox       = faInbox;
  readonly faSpinner     = faSpinner;
  readonly faRotateRight = faRotateRight;
  readonly faPen         = faPen;
  readonly faCheck       = faCheck;
  readonly faXmark       = faXmark;
  readonly faEye         = faEye;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;

  readonly loading       = this.taskSvc.loading;
  readonly activeTab     = signal<TabKey>('PENDING');
  readonly actionLoading = signal(false);
  readonly actionError   = signal<string | null>(null);

  readonly pendingCount    = computed(() => this.taskSvc.myTasks().filter(t => t.status === 'PENDING').length);
  readonly inProgressCount = computed(() => this.taskSvc.myTasks().filter(t => t.status === 'IN_PROGRESS').length);
  readonly completedCount  = computed(() => this.taskSvc.myTasks().filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED').length);

  readonly filtered = computed(() => {
    const tab = this.activeTab();
    if (tab === 'COMPLETED') {
      return this.taskSvc.myTasks().filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');
    }
    return this.taskSvc.myTasks().filter(t => t.status === tab);
  });

  // ── Complete modal state ─────────────────────────────────────────
  readonly showCompleteModal = signal(false);
  readonly taskToComplete    = signal<ReviewTask | null>(null);
  readonly completeOutcome   = signal<ReviewTaskOutcome | ''>('');
  readonly completeComment   = signal('');

  ngOnInit(): void {
    this.taskSvc.getMyTasks().subscribe();
  }

  refresh(): void {
    this.taskSvc.getMyTasks().subscribe();
  }

  viewDocument(documentId: string): void {
    this.router.navigate(['/documentos/view', documentId]);
  }

  claimTask(taskId: string): void {
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.taskSvc.claimTask(taskId).subscribe({
      next: () => {
        this.taskSvc.getMyTasks().subscribe();
        this.actionLoading.set(false);
        this.activeTab.set('IN_PROGRESS');
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al reclamar la tarea');
        this.actionLoading.set(false);
      },
    });
  }

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
        this.taskSvc.getMyTasks().subscribe();
        this.activeTab.set('COMPLETED');
      },
      error: e => {
        this.actionError.set(e.error?.message ?? 'Error al completar la tarea');
        this.actionLoading.set(false);
      },
    });
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

  truncateId(id: string): string {
    return id.substring(0, 8) + '…';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}
