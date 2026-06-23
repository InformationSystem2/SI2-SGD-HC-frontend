import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faSpinner, faUser, faEdit, faSave, faTimes, faFileMedical, faPlus, faFileLines, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClinicalHistoryService } from '../../services/clinical-history.service';
import { Allergy, ClinicalHistory, Medication } from '../../models/clinical-history.model';
import { DocumentService } from '../../../documents/services/document.service';
import { Document, DocumentStatus } from '../../../documents/models/document.model';

@Component({
  selector: 'app-clinical-history',
  imports: [FontAwesomeModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './clinical-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicalHistoryPage implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private clinicalHistoryService = inject(ClinicalHistoryService);
  private documentService = inject(DocumentService);
  readonly auth = inject(AuthService);

  readonly faUser        = faUser;
  readonly faSpinner     = faSpinner;
  readonly faArrowLeft   = faArrowLeft;
  readonly faEdit        = faEdit;
  readonly faSave        = faSave;
  readonly faTimes       = faTimes;
  readonly faFileMedical = faFileMedical;
  readonly faPlus        = faPlus;
  readonly faFileLines   = faFileLines;
  readonly faEye         = faEye;
  readonly faTrash       = faTrash;

  readonly loading  = signal(false);
  readonly notFound = signal(false);
  readonly patient  = signal<Patient | null>(null);

  // Documentos asociados a la HC
  readonly documents    = signal<Document[]>([]);
  readonly loadingDocs  = signal(false);

  // Historia Clínica State
  readonly clinicalHistory = signal<ClinicalHistory | null>(null);
  readonly loadingHistory  = signal(false);
  readonly isEditing       = signal(false);
  readonly saveError       = signal<string | null>(null);

  // Formulario Historia Clínica
  historyForm = this.fb.group({
    code: ['', Validators.required],
    bloodType: [''],
    pathologicalAntecedents: [''],
    nonPathologicalAntecedents: [''],
    familyAntecedents: [''],
    allergies: this.fb.array([] as FormGroup[]),
    chronicConditions: [''],
    currentMedications: this.fb.array([] as FormGroup[]),
    observations: [''],
  });

  get allergies(): FormArray {
    return this.historyForm.get('allergies') as FormArray;
  }

  get medications(): FormArray {
    return this.historyForm.get('currentMedications') as FormArray;
  }

  private newAllergyRow(a?: Allergy): FormGroup {
    return this.fb.group({
      allergen: [a?.allergen ?? '', Validators.required],
      severity: [a?.severity ?? '', Validators.required],
      reaction: [a?.reaction ?? '', Validators.required],
    });
  }

  private newMedicationRow(m?: Medication): FormGroup {
    return this.fb.group({
      medication: [m?.medication ?? '', Validators.required],
      dose:       [m?.dose ?? '', Validators.required],
      frequency:  [m?.frequency ?? '', Validators.required],
    });
  }

  addAllergy(): void { this.allergies.push(this.newAllergyRow()); }
  removeAllergy(i: number): void { this.allergies.removeAt(i); }

  addMedication(): void { this.medications.push(this.newMedicationRow()); }
  removeMedication(i: number): void { this.medications.removeAt(i); }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);

    this.patientService.getPatient(id).subscribe({
      next: p => {
        this.patient.set(p);
        this.loading.set(false);
        this.loadClinicalHistory(p.id!);
        this.loadDocuments(p.id!);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  loadDocuments(patientId: string): void {
    this.loadingDocs.set(true);
    this.documentService.getByPatient(patientId).subscribe({
      next: docs => {
        this.documents.set(docs);
        this.loadingDocs.set(false);
      },
      error: () => {
        this.documents.set([]);
        this.loadingDocs.set(false);
      },
    });
  }

  loadClinicalHistory(patientId: string): void {
    this.loadingHistory.set(true);
    this.clinicalHistoryService.getByPatientId(patientId).subscribe({
      next: hc => {
        this.clinicalHistory.set(hc);
        this.loadingHistory.set(false);
        this.patchForm(hc);
      },
      error: () => {
        this.clinicalHistory.set(null);
        this.loadingHistory.set(false);
        // Autogenerar código de HC sugerido para cuando decidan abrirla
        const p = this.patient();
        const suggestedCode = `HC-${new Date().getFullYear()}-${p?.documentNumber || p?.id?.substring(0, 8)}`;
        this.historyForm.patchValue({ code: suggestedCode });
      }
    });
  }

  patchForm(hc: ClinicalHistory): void {
    this.historyForm.patchValue({
      code: hc.code,
      bloodType: hc.bloodType || '',
      pathologicalAntecedents: hc.pathologicalAntecedents || '',
      nonPathologicalAntecedents: hc.nonPathologicalAntecedents || '',
      familyAntecedents: hc.familyAntecedents || '',
      chronicConditions: hc.chronicConditions || '',
      observations: hc.observations || '',
    });

    this.allergies.clear();
    (hc.allergies ?? []).forEach(a => this.allergies.push(this.newAllergyRow(a)));

    this.medications.clear();
    (hc.currentMedications ?? []).forEach(m => this.medications.push(this.newMedicationRow(m)));
  }

  startEditing(): void {
    this.saveError.set(null);
    this.isEditing.set(true);
    const hc = this.clinicalHistory();
    if (hc) {
      this.patchForm(hc);
    }
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.saveError.set(null);
  }

  saveHistory(): void {
    if (this.historyForm.invalid) {
      this.historyForm.markAllAsTouched();
      return;
    }

    const p = this.patient();
    if (!p) return;

    this.saveError.set(null);
    const rawVal = this.historyForm.getRawValue();
    const hc = this.clinicalHistory();

    const allergies = (this.allergies.value as Allergy[]) ?? [];
    const currentMedications = (this.medications.value as Medication[]) ?? [];

    if (hc && hc.id) {
      // Actualizar existente
      this.clinicalHistoryService.update(hc.id, {
        bloodType: rawVal.bloodType || undefined,
        pathologicalAntecedents: rawVal.pathologicalAntecedents || undefined,
        nonPathologicalAntecedents: rawVal.nonPathologicalAntecedents || undefined,
        familyAntecedents: rawVal.familyAntecedents || undefined,
        allergies,
        chronicConditions: rawVal.chronicConditions || undefined,
        currentMedications,
        observations: rawVal.observations || undefined,
      }).subscribe({
        next: updated => {
          this.clinicalHistory.set(updated);
          this.isEditing.set(false);
        },
        error: err => {
          this.saveError.set(err.error?.message || 'Error al guardar la historia clínica.');
        }
      });
    } else {
      // Crear nueva
      const newHc: ClinicalHistory = {
        patientId: p.id!,
        code: rawVal.code!,
        bloodType: rawVal.bloodType || undefined,
        pathologicalAntecedents: rawVal.pathologicalAntecedents || undefined,
        nonPathologicalAntecedents: rawVal.nonPathologicalAntecedents || undefined,
        familyAntecedents: rawVal.familyAntecedents || undefined,
        allergies,
        chronicConditions: rawVal.chronicConditions || undefined,
        currentMedications,
        observations: rawVal.observations || undefined,
      };

      this.clinicalHistoryService.create(newHc).subscribe({
        next: created => {
          this.clinicalHistory.set(created);
          this.isEditing.set(false);
          // El backend vincula retroactivamente los documentos previos del
          // paciente a la nueva historia clínica: recargamos la lista.
          this.loadDocuments(p.id!);
        },
        error: err => {
          this.saveError.set(err.error?.message || 'Error al crear la historia clínica.');
        }
      });
    }
  }

  back(): void {
    const p = this.patient();
    if (p?.id) {
      this.router.navigate(['/patients/detail', p.id]);
    } else {
      this.router.navigate(['/patients/list']);
    }
  }

  // ── Documentos ─────────────────────────────────────────────────────────────

  /** Abre el editor para crear un documento ya asociado a este paciente (y su HC). */
  newDocument(): void {
    const p = this.patient();
    if (!p?.id) return;
    this.router.navigate(['/documents/editor'], { queryParams: { patientId: p.id } });
  }

  viewDocument(id: string): void {
    this.router.navigate(['/documents/view', id]);
  }

  statusClass(status: DocumentStatus): string {
    const classes: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PENDING_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      FINALIZED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-700';
  }

  statusLabel(status: DocumentStatus): string {
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      PENDING_REVIEW: 'Pendiente de revisión',
      REJECTED: 'Rechazado',
      FINALIZED: 'Finalizado',
    };
    return labels[status] ?? status;
  }
}
