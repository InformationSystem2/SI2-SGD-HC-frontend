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
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-role-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './role-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleList implements OnInit{

  readonly rolesService = inject(RolesService);
  private router = inject(Router);

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

  goToEdit(id: number): void {
    this.router.navigate(['/roles/form', id]);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este rol?')) return;
    this.rolesService.deleteRole(id).subscribe();
  }

}
