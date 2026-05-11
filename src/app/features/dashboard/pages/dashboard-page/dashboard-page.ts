import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserInjured, faFileWaveform, faFilePen, faFileCircleCheck,
  faFileCircleXmark, faUserPlus, faCloudArrowUp, faClipboardList,
  faCalendarCheck, faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { PatientService } from '../../../patients/services/patient.service';
import { DocumentService } from '../../../documents/services/document.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {

  private router = inject(Router);
  readonly auth  = inject(AuthService);
  readonly patientService  = inject(PatientService);
  readonly documentService = inject(DocumentService);

  readonly faUserInjured      = faUserInjured;
  readonly faFileWaveform     = faFileWaveform;
  readonly faFilePen          = faFilePen;
  readonly faFileCircleCheck  = faFileCircleCheck;
  readonly faFileCircleXmark  = faFileCircleXmark;
  readonly faUserPlus         = faUserPlus;
  readonly faCloudArrowUp     = faCloudArrowUp;
  readonly faClipboardList    = faClipboardList;
  readonly faCalendarCheck    = faCalendarCheck;
  readonly faArrowRight       = faArrowRight;

  readonly totalPatients  = computed(() => this.patientService.patients().length);
  readonly totalDocs      = computed(() => this.documentService.documents().length);
  readonly completedDocs  = computed(() =>
    this.documentService.documents().filter(d => d.status === 'COMPLETED').length
  );
  readonly pendingDocs    = computed(() =>
    this.documentService.documents().filter(d => d.status === 'PENDING_SIGNATURE').length
  );
  readonly recentDocs     = computed(() =>
    [...this.documentService.documents()]
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .slice(0, 5)
  );

  readonly today = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
    this.documentService.getAll().subscribe();
  }

  goTo(path: string): void { this.router.navigate([path]); }
}
