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

interface FieldDef {
  name:     string;
  type:     FieldType;
  label:    string;
  required: boolean;
  options:  OptionEntry[];
  /** order is derived from array index on submit */
}

const TYPES_WITH_OPTIONS: FieldType[] = [FieldType.SELECT, FieldType.RADIO];

function emptyField(): FieldDef {
  return { name: '', type: FieldType.TEXT, label: '', required: false, options: [] };
}

@Component({
  selector: 'app-template-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './template-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateForm implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  readonly templateService = inject(DocumentTemplateService);

  readonly faArrowLeft  = faArrowLeft;
  readonly faFloppyDisk = faFloppyDisk;
  readonly faPlus       = faPlus;
  readonly faTrash      = faTrash;
  readonly faSpinner    = faSpinner;

  readonly isEdit     = signal(false);
  readonly templateId = signal<string | null>(null);
  readonly loading    = signal(false);

  readonly fieldTypes         = Object.values(FieldType);
  readonly typesWithOptions   = TYPES_WITH_OPTIONS;

  fields      = signal<FieldDef[]>([emptyField()]);
  fieldsError = signal<string | null>(null);

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(100)]],
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
              type:     cfg.type,
              label:    cfg.label,
              required: cfg.required,
              options:  Object.entries(cfg.options ?? {}).map(([key, value]) => ({ key, value })),
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

  // ── Field CRUD ──────────────────────────────────────────────────────────────

  addField(): void {
    this.fields.update(f => [...f, emptyField()]);
  }

  removeField(index: number): void {
    this.fields.update(f => f.filter((_, i) => i !== index));
  }

  updateField(index: number, patch: Partial<FieldDef>): void {
    this.fields.update(f => f.map((field, i) => i === index ? { ...field, ...patch } : field));
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

    const uiSchema: Record<string, {
      type: FieldType; required: boolean; label: string; order: number;
      options?: Record<string, string>;
    }> = {};

    this.fields().forEach((f, i) => {
      const entry: typeof uiSchema[string] = {
        type:     f.type,
        required: f.required,
        label:    f.label.trim() || f.name.trim(),
        order:    i,
      };
      if (this.hasOptions(f.type) && f.options.length > 0) {
        entry.options = Object.fromEntries(
          f.options.filter(o => o.key.trim()).map(o => [o.key.trim(), o.value.trim()])
        );
      }
      uiSchema[f.name.trim()] = entry;
    });

    const v = this.form.value;
    const payload = { name: v.name!, description: v.description ?? '', uiSchema };

    const obs$ = this.templateId()
      ? this.templateService.update(this.templateId()!, payload)
      : this.templateService.create(payload);

    obs$.subscribe(() => this.router.navigate(['/documentos/templates']));
  }

  back(): void {
    this.router.navigate(['/documentos/templates']);
  }
}
