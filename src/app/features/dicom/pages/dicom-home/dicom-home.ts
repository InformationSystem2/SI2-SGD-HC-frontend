import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Upload,
  Eye,
  Layers,
  Calendar,
  FileX,
  Loader,
  FolderOpen,
  X,
  Check,
  AlertTriangle,
  CircleAlert,
  File as FileIcon,
  ArrowLeft,
  User,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { DicomApiService } from '../../services/dicom-api.service';
import { PatientService }  from '../../../patients/services/patient.service';
import { DicomStudy, DicomUploadMultiResult } from '../../models/dicom.model';
import { Patient }         from '../../../patients/models/patient.model';

export interface PatientGroup {
  patient: Patient | null;
  patientId: string | null;
  studies: DicomStudy[];
}

@Component({
  selector: 'app-dicom-home',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, TranslatePipe],
  templateUrl: './dicom-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomHome implements OnInit {

  private router      = inject(Router);
  private apiSvc      = inject(DicomApiService);
  private patientSvc  = inject(PatientService);
  private cdr         = inject(ChangeDetectorRef);

  back(): void {
    this.router.navigate(['/documentos/list']);
  }

  // ── Iconos ────────────────────────────────────────────────────────────────
  readonly ArrowLeft  = ArrowLeft;
  readonly Upload     = Upload;
  readonly Eye        = Eye;
  readonly Layers     = Layers;
  readonly Calendar   = Calendar;
  readonly FileX      = FileX;
  readonly Loader     = Loader;
  readonly FolderOpen = FolderOpen;
  readonly X          = X;
  readonly Check      = Check;
  readonly AlertTriangle = AlertTriangle;
  readonly CircleAlert = CircleAlert;
  readonly FileIcon   = FileIcon;
  readonly User       = User;
  readonly ChevronDown  = ChevronDown;
  readonly ChevronRight = ChevronRight;
  readonly Minimize2    = Minimize2;
  readonly Maximize2    = Maximize2;

  // ── Estado lista ──────────────────────────────────────────────────────────
  readonly studies      = signal<DicomStudy[]>([]);
  readonly allPatients  = signal<Patient[]>([]);
  readonly listLoading  = signal(true);
  readonly listError    = signal<string | null>(null);

  // ── Estado upload ─────────────────────────────────────────────────────────
  readonly showUpload   = signal(false);
  readonly uploading    = signal(false);
  readonly uploadError  = signal<string | null>(null);
  readonly uploadResult = signal<DicomUploadMultiResult | null>(null);
  readonly selectedFiles = signal<File[]>([]);

  selectedPatientId = '';
  dragOver = false;

  // ── Grupos colapsados (key = patientId | '__unknown__') ───────────────────
  /** Conjunto de IDs de pacientes con su bloque de estudios colapsado. */
  readonly collapsedGroups = signal<Set<string>>(new Set());

  isGroupCollapsed(key: string | null): boolean {
    return this.collapsedGroups().has(key ?? '__unknown__');
  }

  toggleGroup(key: string | null): void {
    const k = key ?? '__unknown__';
    this.collapsedGroups.update(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  collapseAll(): void {
    const keys = this.groupedStudies().map(g => g.patientId ?? '__unknown__');
    this.collapsedGroups.set(new Set(keys));
  }

  expandAll(): void {
    this.collapsedGroups.set(new Set());
  }

  /** Indica si todos los grupos están actualmente colapsados. */
  readonly allCollapsed = computed(() => {
    const groups = this.groupedStudies();
    if (groups.length === 0) return false;
    const collapsed = this.collapsedGroups();
    return groups.every(g => collapsed.has(g.patientId ?? '__unknown__'));
  });

  // ── Agrupación por paciente ───────────────────────────────────────────────
  readonly groupedStudies = computed<PatientGroup[]>(() => {
    const studyList   = this.studies();
    const patientList = this.allPatients();
    const patientMap  = new Map(patientList.map(p => [p.id, p]));

    const groupMap = new Map<string, PatientGroup>();

    for (const study of studyList) {
      const key = study.patientId ?? '__unknown__';
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          patientId: study.patientId,
          patient: study.patientId ? (patientMap.get(study.patientId) ?? null) : null,
          studies: [],
        });
      }
      groupMap.get(key)!.studies.push(study);
    }

    return Array.from(groupMap.values()).sort((a, b) => {
      const nameA = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '';
      const nameB = b.patient ? `${b.patient.firstName} ${b.patient.lastName}` : '';
      return nameA.localeCompare(nameB);
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.listLoading.set(true);
    this.listError.set(null);

    forkJoin({
      studies:  this.apiSvc.listStudies(),
      patients: this.patientSvc.getPatients(),
    }).subscribe({
      next: ({ studies, patients }) => {
        this.studies.set(studies);
        this.allPatients.set(patients);
        this.listLoading.set(false);
        this.cdr.markForCheck();
      },
      error: e => {
        this.listError.set(e.error?.message ?? 'Error al cargar datos DICOM');
        this.listLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  openViewer(study: DicomStudy): void {
    this.router.navigate(['/dicom/viewer', study.id]);
  }

  openLocalViewer(): void {
    this.router.navigate(['/dicom/local']);
  }

  // ── Panel de carga ────────────────────────────────────────────────────────

  toggleUpload(): void {
    this.showUpload.update(v => !v);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const list = e.dataTransfer?.files;
    if (list) this.addFiles(Array.from(list));
  }

  onFilesSelected(input: HTMLInputElement): void {
    const list = input.files;
    if (list) this.addFiles(Array.from(list));
    input.value = '';
  }

  private addFiles(files: File[]): void {
    const dicomLike = files.filter(f =>
      f.name.toLowerCase().endsWith('.dcm') || !f.name.includes('.'),
    );
    if (dicomLike.length === 0) return;

    this.selectedFiles.update(prev => {
      const seen = new Set(prev.map(f => `${f.name}::${f.size}`));
      const additions = dicomLike.filter(f => !seen.has(`${f.name}::${f.size}`));
      return [...prev, ...additions];
    });
    this.cdr.markForCheck();
  }

  removeFile(file: File): void {
    this.selectedFiles.update(list => list.filter(f => f !== file));
  }

  clearFiles(): void { this.selectedFiles.set([]); }

  upload(): void {
    const patientId = this.selectedPatientId;
    const files = this.selectedFiles();
    if (!patientId || files.length === 0) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadResult.set(null);

    this.apiSvc.uploadDicomMulti(patientId, files).subscribe({
      next: result => {
        this.uploading.set(false);
        this.uploadResult.set(result);
        this.selectedFiles.set([]);
        this.reloadStudies();

        if (result.study && result.uploaded.length > 0) {
          setTimeout(() => this.router.navigate(['/dicom/viewer', result.study!.id]), 800);
        } else {
          this.cdr.markForCheck();
        }
      },
      error: e => {
        this.uploadError.set(e.error?.message ?? 'Error al subir los archivos DICOM');
        this.uploading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private reloadStudies(): void {
    this.apiSvc.listStudies().subscribe({
      next: data => { this.studies.set(data); this.cdr.markForCheck(); },
    });
  }

  totalBytes(): number {
    return this.selectedFiles().reduce((acc, f) => acc + f.size, 0);
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  modalityBadgeClass(modality: string): string {
    const map: Record<string, string> = {
      CT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
      MR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      US: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
      CR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      DX: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
      PT: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
    };
    return map[modality] ?? 'bg-hc-muted text-hc-text-2';
  }

  totalImages(study: DicomStudy): number {
    return study.series.reduce((acc, s) => acc + s.instances.length, 0);
  }

  modalities(study: DicomStudy): string[] {
    return [...new Set(study.series.map(s => s.modality))];
  }

  patientName(p: Patient): string {
    return `${p.firstName} ${p.lastName}`;
  }
}
