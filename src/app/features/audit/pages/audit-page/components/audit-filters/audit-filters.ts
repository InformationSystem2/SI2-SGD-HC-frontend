import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Filter, X, Search, Download } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuditState } from '../../../../services/audit-state.service';
import { AuditFilters } from '../../../../models/audit.models';
import { AuditService } from '../../../../services/audit.service';

@Component({
  selector: 'app-audit-filters',
  imports: [FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './audit-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditFiltersComponent {

  readonly auditState = inject(AuditState);
  private auditService = inject(AuditService);

  readonly Filter = Filter;
  readonly X = X;
  readonly Search = Search;
  readonly Download = Download;

  readonly actionTypes = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

  exporting = signal(false);

  onFilterChange(changes: Partial<AuditFilters>) {
    this.auditState.updateFilters({ ...changes, page: 0 });
  }

  onClear() {
    this.auditState.resetFilters();
  }

  onExportCsv() {
    this.exporting.set(true);
    this.auditService.exportCsv(this.auditState.filters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false)
    });
  }
}
