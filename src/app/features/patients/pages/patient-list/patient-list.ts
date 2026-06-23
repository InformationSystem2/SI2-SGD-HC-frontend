import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEye, faPencil, faSpinner, faTrash, faUserPlus, faUsers, faMagnifyingGlass, faXmark, faFileMedical,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PatientService } from '../../services/patient.service';
import { TenantService } from '../../../tenants/services/tenant.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-list',
  imports: [FontAwesomeModule, TranslatePipe, FormsModule],
  templateUrl: './patient-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientList implements OnInit {

  readonly patientService = inject(PatientService);
  readonly tenantService = inject(TenantService);
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  readonly faUserPlus         = faUserPlus;
  readonly faSpinner          = faSpinner;
  readonly faUsers            = faUsers;
  readonly faPencil           = faPencil;
  readonly faTrash            = faTrash;
  readonly faEye              = faEye;
  readonly faMagnifyingGlass  = faMagnifyingGlass;
  readonly faXmark            = faXmark;
  readonly faFileMedical      = faFileMedical;

  readonly isSuperuser = computed(() =>
    this.auth.roles().includes('ROLE_SUPERUSER'),
  );

  // ── Filtros ────────────────────────────────────────────────────────────────
  readonly search       = signal('');
  readonly filterGender = signal<'all' | 'MALE' | 'FEMALE'>('all');
  readonly filterTenant = signal<string>(typeof localStorage !== 'undefined' ? localStorage.getItem('impersonatedTenantSlug') || '' : '');

  onSearch(v: string)        { this.search.set(v);               this.page.set(0); }
  clearSearch()              { this.search.set('');              this.page.set(0); }
  onGenderChange(v: string)  { this.filterGender.set(v as any); this.page.set(0); }
  onTenantChange(v: string)  {
    this.filterTenant.set(v);
    this.page.set(0);
    if (v) {
      localStorage.setItem('impersonatedTenantSlug', v);
    } else {
      localStorage.removeItem('impersonatedTenantSlug');
    }
    // Reload patients under the new tenant context
    this.patientService.getPatients().subscribe();
  }

  clearFilters() {
    this.search.set('');
    this.filterGender.set('all');
    if (this.isSuperuser()) {
      this.filterTenant.set('');
      localStorage.removeItem('impersonatedTenantSlug');
      this.patientService.getPatients().subscribe();
    }
    this.page.set(0);
  }

  readonly hasActiveFilters = computed(() =>
    !!this.search() || this.filterGender() !== 'all' || (this.isSuperuser() && !!this.filterTenant())
  );

  readonly availableTenants = computed(() => this.tenantService.tenants());

  // ── Computed: lista filtrada ──────────────────────────────────────────────
  readonly filtered = computed(() => {
    const q      = this.search().toLowerCase().trim();
    const gender = this.filterGender();

    return this.patientService.patients().filter(p => {
      const matchQ = !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.documentNumber ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').includes(q);

      const matchGender = gender === 'all' || (p.gender ?? '').toUpperCase() === gender;

      return matchQ && matchGender;
    });
  });

  readonly PAGE_SIZE    = 20;
  readonly page         = signal(0);
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

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
    if (this.isSuperuser()) {
      this.tenantService.getTenants(0, 1000).subscribe();
    }
  }

  goToRegister(): void { this.router.navigate(['/patients/register']); }
  goToDetail(id: string): void { this.router.navigate(['/patients/detail', id]); }
  goToClinicalHistory(id: string): void { this.router.navigate(['/patients/clinical-history', id]); }
  goToEdit(id: string): void { this.router.navigate(['/patients/form', id]); }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.patientService.deletePatient(id).subscribe();
  }
}
