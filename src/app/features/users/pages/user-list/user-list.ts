import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import {
  faCircleCheck, faCircleXmark, faEye, faKey,
  faPencil, faSpinner, faTrash, faUserPlus, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {

  readonly userService  = inject(UserService);
  readonly rolesService = inject(RolesService);
  private authService   = inject(AuthService);
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

  readonly isSuperuser = computed(() =>
    this.authService.roles().includes('ROLE_SUPERUSER'),
  );

  readonly PAGE_SIZE    = 20;
  readonly page         = signal(0);
  readonly totalItems   = computed(() => this.userService.users().length);
  readonly totalPages   = computed(() => Math.ceil(this.totalItems() / this.PAGE_SIZE) || 1);
  readonly paged        = computed(() => {
    const s = this.page() * this.PAGE_SIZE;
    return this.userService.users().slice(s, s + this.PAGE_SIZE);
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
  }

  getRoleNames(ids: string[]): string[] {
    return (ids ?? []).map(id => {
      const role = this.rolesService.roles().find(r => r.id === id);
      return role?.name ?? `#${id}`;
    });
  }

  goToRegister(): void {
    this.router.navigate(['/usuarios/register']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/usuarios/detail', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/usuarios/form', id]);
  }

  goToPassword(id: string): void {
    this.router.navigate(['/usuarios/password', id]);
  }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.userService.deleteUser(id).subscribe();
  }
}
