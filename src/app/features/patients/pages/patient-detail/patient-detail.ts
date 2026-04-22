import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

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

  readonly faUser      = faUser;
  readonly faSpinner   = faSpinner;
  readonly faArrowLeft = faArrowLeft;

  readonly loading  = signal(false);
  readonly notFound = signal(false);
  readonly patient  = signal<Patient | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);

    this.patientService.getPatient(id).subscribe({
      next: p => { this.patient.set(p); this.loading.set(false); },
      error: () => { this.notFound.set(true); this.loading.set(false); },
    });
  }

  back(): void {
    this.router.navigate(['/pacientes/list']);
  }
}
