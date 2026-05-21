import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faFloppyDisk, faPlus, faSpinner, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { DocumentTemplateService } from '../../services/document-template.service';
import { FieldType } from '../../models/document.model';

interface OptionEntry { key: string; value: string; }

/** Columna dentro del subSchema de un campo ARRAY */
interface SubColDef {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: OptionEntry[];
}

interface FieldDef {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: OptionEntry[];
  /** Columnas del sub-esquema (sólo para type === ARRAY) */
  subCols: SubColDef[];
  /** order is derived from array index on submit */
}

const TYPES_WITH_OPTIONS: FieldType[] = [FieldType.SELECT, FieldType.RADIO];

// Tipos de campo válidos para columnas de un ARRAY (sub-campos escalares)
const SUB_COL_TYPES: FieldType[] = [
  FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER,
  FieldType.DATE, FieldType.TIME, FieldType.EMAIL, FieldType.SELECT,
];

function emptySubCol(): SubColDef {
  return { name: '', type: FieldType.TEXT, label: '', required: false, options: [] }; // <-- Agregado 'options: []'
}

function emptyField(): FieldDef {
  return { name: '', type: FieldType.TEXT, label: '', required: false, options: [], subCols: [] };
}

@Component({
  selector: 'app-template-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './template-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateForm implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly templateService = inject(DocumentTemplateService);

  readonly faArrowLeft = faArrowLeft;
  readonly faFloppyDisk = faFloppyDisk;
  readonly faPlus = faPlus;
  readonly faTrash = faTrash;
  readonly faSpinner = faSpinner;

  readonly isEdit = signal(false);
  readonly templateId = signal<string | null>(null);
  readonly loading = signal(false);

  readonly fieldTypes = Object.values(FieldType);
  readonly subColTypes = SUB_COL_TYPES;
  readonly typesWithOptions = TYPES_WITH_OPTIONS;

  fields = signal<FieldDef[]>([emptyField()]);
  fieldsError = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.templateId.set(id);
      this.loading.set(true);
      this.templateService.getById(id).subscribe({
        next: t => {
          this.form.patchValue({ name: t.name, description: t.description });
          const parsed: FieldDef[] = Object.entries(t.uiSchema)
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([name, cfg]) => ({
              name,
              type: cfg.type,
              label: cfg.label,
              required: cfg.required,
              options: Object.entries(cfg.options ?? {}).map(([key, value]) => ({ key, value })),
              // Dentro de ngOnInit(), busca donde se mapean las 'subCols' y cámbialo por esto:
              subCols: Object.entries(cfg.subSchema ?? {})
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([cName, cCfg]) => ({
                  name: cName,
                  type: cCfg.type,
                  label: cCfg.label,
                  required: cCfg.required,
                  options: Object.entries(cCfg.options ?? {}).map(([key, value]) => ({ key, value })) // <-- NUEVO
                })),
            }));
          this.fields.set(parsed.length ? parsed : [emptyField()]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  hasOptions(type: FieldType): boolean {
    return TYPES_WITH_OPTIONS.includes(type);
  }

  isArray(type: FieldType): boolean {
    return type === FieldType.ARRAY;
  }

  // ── Field CRUD ──────────────────────────────────────────────────────────────

  addField(): void {
    this.fields.update(f => [...f, emptyField()]);
  }

  removeField(index: number): void {
    this.fields.update(f => f.filter((_, i) => i !== index));
  }

  updateField(index: number, patch: Partial<FieldDef>): void {
    this.fields.update(f => f.map((field, i) => {
      if (i !== index) return field;
      const updated = { ...field, ...patch };
      // Si cambia a ARRAY, limpiar options; si sale de ARRAY, limpiar subCols
      if (patch.type !== undefined) {
        if (patch.type === FieldType.ARRAY) updated.options = [];
        else updated.subCols = [];
      }
      return updated;
    }));
  }

  // ── Option CRUD (for SELECT / RADIO) ────────────────────────────────────────

  addOption(fieldIndex: number): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? { ...field, options: [...field.options, { key: '', value: '' }] }
        : field
    ));
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? { ...field, options: field.options.filter((_, oi) => oi !== optionIndex) }
        : field
    ));
  }

  updateOption(fieldIndex: number, optionIndex: number, patch: Partial<OptionEntry>): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? {
          ...field,
          options: field.options.map((opt, oi) => oi === optionIndex ? { ...opt, ...patch } : opt),
        }
        : field
    ));
  }

  // ── SubCol CRUD (for ARRAY columns) ──────────────────────────────────────────

  addSubCol(fieldIndex: number): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? { ...field, subCols: [...field.subCols, emptySubCol()] }
        : field
    ));
  }

  removeSubCol(fieldIndex: number, colIndex: number): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? { ...field, subCols: field.subCols.filter((_, ci) => ci !== colIndex) }
        : field
    ));
  }

  updateSubCol(fieldIndex: number, colIndex: number, patch: Partial<SubColDef>): void {
    this.fields.update(f => f.map((field, i) =>
      i === fieldIndex
        ? {
          ...field,
          subCols: field.subCols.map((col, ci) => ci === colIndex ? { ...col, ...patch } : col),
        }
        : field
    ));
  }

  // ── SubCol Options CRUD (for SELECT / RADIO inside ARRAY) ────────────────────

  addSubColOption(fieldIndex: number, colIndex: number): void {
    this.fields.update(f => f.map((field, i) => {
      if (i !== fieldIndex) return field;
      const newSubCols = field.subCols.map((col, ci) =>
        ci === colIndex ? { ...col, options: [...col.options, { key: '', value: '' }] } : col
      );
      return { ...field, subCols: newSubCols };
    }));
  }

  removeSubColOption(fieldIndex: number, colIndex: number, optionIndex: number): void {
    this.fields.update(f => f.map((field, i) => {
      if (i !== fieldIndex) return field;
      const newSubCols = field.subCols.map((col, ci) =>
        ci === colIndex ? { ...col, options: col.options.filter((_, oi) => oi !== optionIndex) } : col
      );
      return { ...field, subCols: newSubCols };
    }));
  }

  updateSubColOption(fieldIndex: number, colIndex: number, optionIndex: number, patch: Partial<OptionEntry>): void {
    this.fields.update(f => f.map((field, i) => {
      if (i !== fieldIndex) return field;
      const newSubCols = field.subCols.map((col, ci) => {
        if (ci !== colIndex) return col;
        const newOptions = col.options.map((opt, oi) => oi === optionIndex ? { ...opt, ...patch } : opt);
        return { ...col, options: newOptions };
      });
      return { ...field, subCols: newSubCols };
    }));
  }
  // ── Submit ───────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const invalidField = this.fields().find(f => !f.name.trim());
    if (invalidField !== undefined || this.fields().length === 0) {
      this.fieldsError.set('Todos los campos deben tener un nombre');
      return;
    }
    this.fieldsError.set(null);

    const uiSchema: Record<string, unknown> = {};

    this.fields().forEach((f, i) => {
      const entry: Record<string, unknown> = {
        type: f.type,
        required: f.required,
        label: f.label.trim() || f.name.trim(),
        order: i,
      };

      if (this.hasOptions(f.type) && f.options.length > 0) {
        entry['options'] = Object.fromEntries(
          f.options.filter(o => o.key.trim()).map(o => [o.key.trim(), o.value.trim()])
        );
      }

      if (f.type === FieldType.ARRAY && f.subCols.length > 0) {
        const subSchema: Record<string, unknown> = {};
        f.subCols.forEach((col, ci) => {
          if (!col.name.trim()) return;

          const colEntry: Record<string, unknown> = {
            type: col.type,
            required: col.required,
            label: col.label.trim() || col.name.trim(),
            order: ci,
          };

          // NUEVO: Agregar options si el tipo lo permite
          if (this.hasOptions(col.type) && col.options.length > 0) {
            colEntry['options'] = Object.fromEntries(
              col.options.filter(o => o.key.trim()).map(o => [o.key.trim(), o.value.trim()])
            );
          }

          subSchema[col.name.trim()] = colEntry;
        });
        entry['subSchema'] = subSchema;
      }

      uiSchema[f.name.trim()] = entry;
    });

    const v = this.form.value;
    const payload = { name: v.name!, description: v.description ?? '', uiSchema } as any;

    const obs$ = this.templateId()
      ? this.templateService.update(this.templateId()!, payload)
      : this.templateService.create(payload);

    obs$.subscribe(() => this.router.navigate(['/documentos/templates']));
  }

  back(): void {
    this.router.navigate(['/documentos/templates']);
  }
}
