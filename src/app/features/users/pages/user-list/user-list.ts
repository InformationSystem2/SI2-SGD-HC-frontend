import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import {
  faCircleCheck, faCircleXmark, faEye, faKey,
  faPencil, faSpinner, faTrash, faUserPlus, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';

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
    if (!confirm('¿Eliminar este usuario?')) return;
    this.userService.deleteUser(id).subscribe();
  }
}
