import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule, X, Clock, Database, Globe, User, Shield, Building2, AlertTriangle } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLog } from '../../../models/audit.models';

@Component({
  selector: 'app-audit-detail-modal',
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './audit-detail-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditDetailModalComponent {

  readonly log = input.required<AuditLog>();
  readonly close = output<void>();

  readonly X = X;
  readonly Clock = Clock;
  readonly Database = Database;
  readonly Globe = Globe;
  readonly User = User;
  readonly Shield = Shield;
  readonly Building2 = Building2;
  readonly AlertTriangle = AlertTriangle;

  formatDate(dateStr: string, type: 'date' | 'time'): string {
    const d = new Date(dateStr);
    if (type === 'date') return d.toLocaleDateString('es-BO');
    return d.toLocaleTimeString('es-BO');
  }

  formatJson(obj: Record<string, unknown> | undefined | string): string {
    if (!obj) return 'null';
    if (typeof obj === 'string') {
        try {
            const parsed = JSON.parse(obj);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return obj;
        }
    }
    return JSON.stringify(obj, null, 2);
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
