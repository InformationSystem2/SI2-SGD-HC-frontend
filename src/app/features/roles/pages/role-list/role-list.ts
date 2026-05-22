import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPencil,
  faTrash,
  faSpinner,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { RolesService } from '../../services/roles.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-role-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './role-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleList implements OnInit{

  readonly rolesService = inject(RolesService);
  private router = inject(Router);
  private translate = inject(TranslateService);  

  readonly faPlus          = faPlus;
  readonly faPencil        = faPencil;
  readonly faTrash         = faTrash;
  readonly faSpinner       = faSpinner;
  readonly faShieldHalved  = faShieldHalved;

  ngOnInit(): void {
    this.rolesService.loadRoles().subscribe();
  }

  goToCreate(): void {
    this.router.navigate(['/roles/form']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/roles/form', id]);
  }

  delete(id: string): void {
    const msg = this.translate.instant('COMMON.CONFIRM_DELETE');
    if (!confirm(msg)) return;
    this.rolesService.deleteRole(id).subscribe();
  }

}
