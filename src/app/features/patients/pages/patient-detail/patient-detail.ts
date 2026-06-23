import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faSpinner, faUser, faFileMedical } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './patient-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetail implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  readonly auth = inject(AuthService);

  readonly faUser        = faUser;
  readonly faSpinner     = faSpinner;
  readonly faArrowLeft   = faArrowLeft;
  readonly faFileMedical = faFileMedical;

  readonly loading  = signal(false);
  readonly notFound = signal(false);
  readonly patient  = signal<Patient | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);

    this.patientService.getPatient(id).subscribe({
      next: p => {
        this.patient.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  goToClinicalHistory(): void {
    const p = this.patient();
    if (p?.id) {
      this.router.navigate(['/patients/clinical-history', p.id]);
    }
  }

  back(): void {
    this.router.navigate(['/patients/list']);
  }
}
