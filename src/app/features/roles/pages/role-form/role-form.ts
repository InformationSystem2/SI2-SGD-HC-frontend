import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../services/roles.service';
import { faFloppyDisk, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-role-form',
  imports: [
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  templateUrl: './role-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm implements OnInit{

  private fb    = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  readonly rolesService = inject(RolesService);

  readonly faShieldHalved = faShieldHalved;
  readonly faSpinner      = faSpinner;
  readonly faFloppyDisk   = faFloppyDisk;

  readonly editId = signal<number | null>(null);
  readonly isEdit = signal(false);

  form = this.fb.group({
    name:        ['', Validators.required],
    description: ['', Validators.required],
    active:      [true],
  });



  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = Number(id);
      this.editId.set(numId);
      this.isEdit.set(true);

      this.rolesService.getRole(numId).subscribe(role => {
        this.form.patchValue({
          name:        role.name,
          description: role.description,
          active:      role.active,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, active } = this.form.value;

    if (this.isEdit()) {
      this.rolesService
        .updateRole(this.editId()!, {
          name:           name!,
          description:    description!,
          active:         active!,
          permissionsIds: [],   // ajustar si tienes selector de permisos
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    } else {
      this.rolesService
        .createRole({
          name:           name!,
          description:    description!,
          permissionsIds: [],
        })
        .subscribe(() => this.router.navigate(['/roles/list']));
    }
  }

  cancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
