import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faClock, faCheckCircle, faTimesCircle, faSpinner, faExclamationTriangle, faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { ReviewTaskService } from '../../services/review-task.service';
import { WorkflowStats } from '../../models/workflow.model';

@Component({
  selector: 'app-workflow-stats',
  standalone: true,
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './workflow-stats.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStatsPage implements OnInit {
  private readonly reviewTaskService = inject(ReviewTaskService);

  readonly stats = signal<WorkflowStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly faClock = faClock;
  readonly faCheckCircle = faCheckCircle;
  readonly faTimesCircle = faTimesCircle;
  readonly faSpinner = faSpinner;
  readonly faExclamationTriangle = faExclamationTriangle;
  readonly faChartBar = faChartBar;

  ngOnInit(): void {
    this.reviewTaskService.getStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message ?? 'Error'); this.loading.set(false); },
    });
  }
}
