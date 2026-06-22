import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInbox, faSpinner, faRotateRight, faPen, faCheck, faXmark,
  faEye, faCircleCheck, faCircleXmark, faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { ReviewTaskService } from '../../services/review-task.service';
import { WorkflowService } from '../../services/workflow.service';
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
  private workflowSvc = inject(WorkflowService);
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
  readonly faSearch = faSearch;

  readonly loading       = computed(() => this.workflowSvc.loading());
  readonly viewMode      = signal<'ASSIGNED_TO_ME' | 'ASSIGNED_BY_ME'>('ASSIGNED_TO_ME');
  readonly activeWfTab   = signal<TabKey>('PENDING');
  readonly searchQuery   = signal('');

  readonly currentWorkflows = computed(() => {
    return this.viewMode() === 'ASSIGNED_TO_ME' ? this.workflowSvc.assignedWorkflows() : this.workflowSvc.workflows();
  });

  readonly wfPendingCount    = computed(() => this.currentWorkflows().filter(w => this.getWorkflowTabStatus(w) === 'PENDING').length);
  readonly wfInProgressCount = computed(() => this.currentWorkflows().filter(w => this.getWorkflowTabStatus(w) === 'IN_PROGRESS').length);
  readonly wfCompletedCount  = computed(() => this.currentWorkflows().filter(w => this.getWorkflowTabStatus(w) === 'COMPLETED').length);

  readonly filteredWorkflows = computed(() => {
    const tab = this.activeWfTab();
    const query = this.searchQuery().toLowerCase().trim();
    let workflows = this.currentWorkflows().filter(w => this.getWorkflowTabStatus(w) === tab);
    
    if (query) {
      workflows = workflows.filter(w =>
        w.title.toLowerCase().includes(query) ||
        (w.assigneeName && w.assigneeName.toLowerCase().includes(query)) ||
        (w.dueDate && this.formatDate(w.dueDate).toLowerCase().includes(query)) ||
        w.status.toLowerCase().includes(query)
      );
    }
    return workflows;
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (this.viewMode() === 'ASSIGNED_TO_ME') {
      this.workflowSvc.getWorkflowsAssignedToMe().subscribe();
    } else {
      this.workflowSvc.getMyWorkflows().subscribe();
    }
  }

  toggleViewMode(mode: 'ASSIGNED_TO_ME' | 'ASSIGNED_BY_ME'): void {
    this.viewMode.set(mode);
    this.refresh();
  }

  viewWorkflow(workflowId: string): void {
    this.router.navigate(['/tasks/workflow', workflowId]);
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

  getWorkflowTabStatus(wf: any): TabKey {
    if (wf.status === 'COMPLETED' || wf.status === 'CANCELLED') {
      return 'COMPLETED';
    }
    if (wf.completedTaskCount > 0 || (wf.tasks && wf.tasks.some((t: any) => t.status === 'IN_PROGRESS'))) {
      return 'IN_PROGRESS';
    }
    return 'PENDING';
  }
}
