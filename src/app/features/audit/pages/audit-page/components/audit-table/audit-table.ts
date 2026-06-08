import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { LucideAngularModule, Clock, Database } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuditState } from '../../../../services/audit-state.service';
import { AuditLog } from '../../../../models/audit.models';

@Component({
  selector: 'app-audit-table',
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './audit-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTableComponent {

  readonly auditState = inject(AuditState);
  readonly viewDetails = output<AuditLog>();

  readonly Clock = Clock;
  readonly Database = Database;

  readonly PAGE_SIZE = 7;
  readonly page = computed(() => this.auditState.currentPage());
  readonly totalPages = computed(() => this.auditState.totalPages());

  getOperationClass(actionType: string): string {
    switch (actionType?.toUpperCase()) {
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'UPDATE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30';
      case 'READ': return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
      case 'LOGIN':
      case 'LOGOUT': return 'bg-hc-primary/10 text-hc-primary border-hc-primary/20 dark:bg-hc-primary/20 dark:text-hc-primary-light dark:border-hc-primary/30';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
    }
  }
  getSeverityClass(severity?: string): string {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      case 'WARNING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
      case 'INFO':
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
    }
  }


  formatDate(dateStr: string, type: 'full' | 'date' | 'time'): string {
    const d = new Date(dateStr);
    if (type === 'full') {
      return d.toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } else if (type === 'date') {
      return d.toLocaleDateString('es-BO');
    } else {
      return d.toLocaleTimeString('es-BO');
    }
  }

  prevPage() {
    this.auditState.updateFilters({ page: Math.max(0, this.page() - 1) });
  }

  nextPage() {
    this.auditState.updateFilters({ page: Math.min(this.totalPages() - 1, this.page() + 1) });
  }
}
