import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileMedical, faMagnifyingGlass, faSpinner, faXmark, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-clinical-history-index',
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './clinical-history-index.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicalHistoryIndex implements OnInit {

  readonly patientService = inject(PatientService);
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly faFileMedical     = faFileMedical;
  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faSpinner         = faSpinner;
  readonly faXmark           = faXmark;
  readonly faChevronRight    = faChevronRight;

  readonly search = signal('');

  onSearch(v: string) { this.search.set(v); }
  clearSearch()       { this.search.set(''); }

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.patientService.patients().filter(p => {
      if (!q) return true;
      return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.documentNumber ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').includes(q);
    });
  });

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
  }

  openHistory(id: string): void {
    this.router.navigate(['/patients/clinical-history', id]);
  }
}
