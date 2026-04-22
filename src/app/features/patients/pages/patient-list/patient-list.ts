import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faCircleCheck, faCircleXmark, faEye,
  faPencil, faSpinner, faTrash, faUserPlus, faUsers,
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

  readonly faUserPlus    = faUserPlus;
  readonly faSpinner     = faSpinner;
  readonly faUsers       = faUsers;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faPencil      = faPencil;
  readonly faTrash       = faTrash;
  readonly faEye         = faEye;

  ngOnInit(): void {
    this.patientService.getPatients().subscribe();
  }

  goToRegister(): void {
    this.router.navigate(['/pacientes/register']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/pacientes/detail', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/pacientes/form', id]);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este paciente?')) return;
    this.patientService.deletePatient(id).subscribe();
  }
}
