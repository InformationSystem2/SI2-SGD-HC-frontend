import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { AuditState } from '../../services/audit-state.service';
import { AuditFiltersComponent } from './components/audit-filters/audit-filters';
import { AuditTableComponent } from './components/audit-table/audit-table';
import { AuditDetailModalComponent } from './audit-detail-modal/audit-detail-modal';

@Component({
  selector: 'app-audit-page',
  imports: [
    FontAwesomeModule,
    TranslateModule,
    AuditFiltersComponent,
    AuditTableComponent,
    AuditDetailModalComponent,
  ],
  templateUrl: './audit-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditPageComponent implements OnInit {

  readonly auditState = inject(AuditState);
  readonly faShieldHalved = faShieldHalved;

  ngOnInit() {
    this.auditState.refresh();
  }
}

