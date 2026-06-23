import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { TenantService } from '../../../tenants/services/tenant.service';
import { Router } from '@angular/router';
import {
  faCircleCheck, faCircleXmark, faEye, faKey,
  faPencil, faSpinner, faTrash, faUserPlus, faUsers,
  faMagnifyingGlass, faXmark, faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RolePolicyService } from '../../../../core/auth/services/role-policy.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  imports: [FontAwesomeModule, TranslatePipe, FormsModule],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {

  readonly userService  = inject(UserService);
  readonly rolesService = inject(RolesService);
  readonly auth         = inject(AuthService);
  readonly tenantService = inject(TenantService);
  readonly rolePolicyService = inject(RolePolicyService);
  private router        = inject(Router);
  private translate    = inject(TranslateService);

  readonly faUserPlus    = faUserPlus;
  readonly faSpinner     = faSpinner;
  readonly faUsers       = faUsers;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faPencil      = faPencil;
  readonly faTrash       = faTrash;
  readonly faEye         = faEye;
  readonly faKey         = faKey;
  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faXmark       = faXmark;
  readonly faFilter      = faFilter;

  readonly isSuperuser = computed(() =>
    this.auth.roles().includes('ROLE_SUPERUSER'),
  );

  // ── Filtros ────────────────────────────────────────────────────────────────
  readonly search       = signal('');
  readonly filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  readonly filterRole   = signal<string>('');
  readonly filterTenant = signal<string>(typeof localStorage !== 'undefined' ? localStorage.getItem('impersonatedTenantSlug') || '' : '');

  onSearch(v: string)        { this.search.set(v);       this.page.set(0); }
  clearSearch()              { this.search.set('');       this.page.set(0); }
  onStatusChange(v: string)  { this.filterStatus.set(v as any); this.page.set(0); }
  onRoleChange(v: string)    { this.filterRole.set(v);   this.page.set(0); }
  onTenantChange(v: string)  {
    this.filterTenant.set(v);
    this.page.set(0);
    if (v) {
      localStorage.setItem('impersonatedTenantSlug', v);
    } else {
      localStorage.removeItem('impersonatedTenantSlug');
    }
    // Reload users and roles under the new tenant context
    this.userService.getUsers().subscribe();
    this.rolesService.loadRoles().subscribe();
  }

  clearFilters() {
    this.search.set('');
    this.filterStatus.set('all');
    this.filterRole.set('');
    if (this.isSuperuser()) {
      this.filterTenant.set('');
      localStorage.removeItem('impersonatedTenantSlug');
      this.userService.getUsers().subscribe();
      this.rolesService.loadRoles().subscribe();
    }
    this.page.set(0);
  }

  readonly hasActiveFilters = computed(() =>
    !!this.search() || this.filterStatus() !== 'all' || !!this.filterRole() || (this.isSuperuser() && !!this.filterTenant())
  );

  // Roles únicos disponibles para el filtro
  readonly availableRoles = computed(() => this.rolesService.roles());
  readonly availableTenants = computed(() => this.tenantService.tenants());

  // ── Computed: lista filtrada ──────────────────────────────────────────────
  readonly filtered = computed(() => {
    const q      = this.search().toLowerCase().trim();
    const status = this.filterStatus();
    const roleId = this.filterRole();

    return this.userService.users().filter(u => {
      const matchQ = !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.documentNumber ?? '').toLowerCase().includes(q) ||
        (u.username ?? '').toLowerCase().includes(q);

      const matchStatus =
        status === 'all' ? true :
        status === 'active' ? u.isActive :
        !u.isActive;

      const matchRole = !roleId || (u.rolesIds ?? []).map(String).includes(String(roleId));

      return matchQ && matchStatus && matchRole;
    });
  });

  canManageUser(user: any): boolean {
    const roleNames = this.getRoleNames(user.rolesIds);
    return this.rolePolicyService.canManageUserWithRoles(roleNames);
  }

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
    this.userService.getUsers().subscribe();
    this.rolesService.loadRoles().subscribe();
    if (this.isSuperuser()) {
      this.tenantService.getTenants(0, 1000).subscribe();
    }
  }

  getRoleNames(ids: string[]): string[] {
    return (ids ?? []).map(id => {
      const role = this.rolesService.roles().find(r => r.id === id);
      return role?.name ?? `#${id}`;
    });
  }

  goToRegister(): void { this.router.navigate(['/users/register']); }
  goToDetail(id: string): void { this.router.navigate(['/users/detail', id]); }
  goToEdit(id: string): void { this.router.navigate(['/users/form', id]); }
  goToPassword(id: string): void { this.router.navigate(['/users/password', id]); }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.userService.deleteUser(id).subscribe();
  }
}
