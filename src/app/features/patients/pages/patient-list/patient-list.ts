import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEye, faPencil, faSpinner, faTrash, faUserPlus, faUsers, faMagnifyingGlass, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './patient-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientList implements OnInit {

  readonly patientService = inject(PatientService);
  private router = inject(Router);

  readonly faUserPlus         = faUserPlus;
  readonly faSpinner          = faSpinner;
  readonly faUsers            = faUsers;
  readonly faPencil           = faPencil;
  readonly faTrash            = faTrash;
  readonly faEye              = faEye;
  readonly faMagnifyingGlass  = faMagnifyingGlass;
  readonly faXmark            = faXmark;

  readonly search       = signal('');
  readonly PAGE_SIZE    = 20;
  readonly page         = signal(0);
  readonly filtered     = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.patientService.patients();
    return this.patientService.patients().filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.documentNumber ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q)
    );
  });
  readonly totalItems   = computed(() => this.filtered().length);
  readonly totalPages   = computed(() => Math.ceil(this.totalItems() / this.PAGE_SIZE) || 1);
  readonly paged        = computed(() => {
    const s = this.page() * this.PAGE_SIZE;
    return this.filtered().slice(s, s + this.PAGE_SIZE);
  });
  readonly visiblePages = computed(() => {
    const total = this.totalPages(), cur = this.page();
    const start = Math.max(0, Math.min(cur - 2, total - 5));
    const end   = Math.min(total - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  prevPage()          { this.page.update(p => Math.max(0, p - 1)); }
  nextPage()          { this.page.update(p => Math.min(this.totalPages() - 1, p + 1)); }
  goToPage(n: number) { this.page.set(n); }
  onSearch(value: string) { this.search.set(value); this.page.set(0); }
  clearSearch() { this.search.set(''); this.page.set(0); }

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
  }

  goToRegister(): void {
    this.router.navigate(['/pacientes/register']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/pacientes/detail', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/pacientes/form', id]);
  }

  delete(id: string): void {
    if (!confirm('¿Eliminar este paciente?')) return;
    this.patientService.deletePatient(id).subscribe();
  }
}
