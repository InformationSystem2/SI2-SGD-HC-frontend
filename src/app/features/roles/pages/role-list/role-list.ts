import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPencil,
  faTrash,
  faSpinner,
  faShieldHalved,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { RolesService } from '../../services/roles.service';
import { TenantService } from '../../../tenants/services/tenant.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { RolePolicyService, ROLES } from '../../../../core/auth/services/role-policy.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-list',
  imports: [FontAwesomeModule, TranslatePipe, FormsModule],
  templateUrl: './role-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleList implements OnInit {

  readonly rolesService = inject(RolesService);
  readonly tenantService = inject(TenantService);
  readonly auth = inject(AuthService);
  readonly rolePolicyService = inject(RolePolicyService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  readonly faPlus          = faPlus;
  readonly faPencil        = faPencil;
  readonly faTrash         = faTrash;
  readonly faSpinner       = faSpinner;
  readonly faShieldHalved  = faShieldHalved;
  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faXmark         = faXmark;

  readonly isSuperuser = computed(() =>
    this.auth.roles().includes('ROLE_SUPERUSER'),
  );

  // ── Filtros ────────────────────────────────────────────────────────────────
  readonly search       = signal('');
  readonly filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  readonly filterTenant = signal<string>(typeof localStorage !== 'undefined' ? localStorage.getItem('impersonatedTenantSlug') || '' : '');

  onSearch(v: string)       { this.search.set(v);              this.page.set(0); }
  clearSearch()             { this.search.set('');             this.page.set(0); }
  onStatusChange(v: string) { this.filterStatus.set(v as any); this.page.set(0); }
  onTenantChange(v: string)  {
    this.filterTenant.set(v);
    this.page.set(0);
    if (v) {
      localStorage.setItem('impersonatedTenantSlug', v);
    } else {
      localStorage.removeItem('impersonatedTenantSlug');
    }
    // Reload roles under the new tenant context
    this.rolesService.loadRoles().subscribe();
  }

  clearFilters() {
    this.search.set('');
    this.filterStatus.set('all');
    if (this.isSuperuser()) {
      this.filterTenant.set('');
      localStorage.removeItem('impersonatedTenantSlug');
      this.rolesService.loadRoles().subscribe();
    }
    this.page.set(0);
  }

  readonly hasActiveFilters = computed(() =>
    !!this.search() || this.filterStatus() !== 'all' || (this.isSuperuser() && !!this.filterTenant())
  );

  readonly availableTenants = computed(() => this.tenantService.tenants());

  // ── Computed: visible + filtrado ──────────────────────────────────────────
  readonly visibleRoles = computed(() => {
    const roles = this.rolesService.roles();
    const base  = this.rolePolicyService.isSuperuser()
      ? roles
      : roles.filter(r => r.name !== ROLES.SUPERUSER && r.name !== ROLES.ADMIN);

    const q      = this.search().toLowerCase().trim();
    const status = this.filterStatus();

    return base.filter(r => {
      const matchQ = !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q);

      const matchStatus =
        status === 'all'      ? true :
        status === 'active'   ? r.isActive :
        !r.isActive;

      return matchQ && matchStatus;
    });
  });

  canManageRole(roleName: string): boolean {
    return this.rolePolicyService.canManageRole(roleName);
  }

  // ── Paginación ────────────────────────────────────────────────────────────
  readonly PAGE_SIZE    = 20;
  readonly page         = signal(0);
  readonly totalItems   = computed(() => this.visibleRoles().length);
  readonly totalPages   = computed(() => Math.ceil(this.totalItems() / this.PAGE_SIZE) || 1);
  readonly paged        = computed(() => {
    const s = this.page() * this.PAGE_SIZE;
    return this.visibleRoles().slice(s, s + this.PAGE_SIZE);
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
    this.rolesService.loadRoles().subscribe();
    if (this.isSuperuser()) {
      this.tenantService.getTenants(0, 1000).subscribe();
    }
  }

  goToCreate(): void { this.router.navigate(['/roles/form']); }
  goToEdit(id: string): void { this.router.navigate(['/roles/form', id]); }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.rolesService.deleteRole(id).subscribe();
  }
}
