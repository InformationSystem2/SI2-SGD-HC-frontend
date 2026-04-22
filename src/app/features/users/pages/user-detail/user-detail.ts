import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faCircleCheck, faCircleXmark,
  faIdCard, faPhone, faEnvelope, faUser, faShieldHalved, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';
import { RolesService } from '../../../roles/services/roles.service';
import { User } from '../../models/user.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-user-detail',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './user-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetail implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  readonly userService  = inject(UserService);
  readonly rolesService = inject(RolesService);

  readonly faArrowLeft   = faArrowLeft;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faIdCard      = faIdCard;
  readonly faPhone       = faPhone;
  readonly faEnvelope    = faEnvelope;
  readonly faUser        = faUser;
  readonly faShieldHalved = faShieldHalved;
  readonly faSpinner     = faSpinner;

  readonly user    = signal<User | null>(null);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.rolesService.loadRoles().subscribe();
    this.userService.getUser(id).subscribe({
      next:  u  => { this.user.set(u); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar el usuario'); this.loading.set(false); },
    });
  }

  getRoleNames(ids: number[]): string[] {
    return (ids ?? []).map(id => {
      const role = this.rolesService.roles().find(r => r.id === id);
      return role?.name ?? `#${id}`;
    });
  }

  back(): void {
    this.router.navigate(['/usuarios/list']);
  }
}
