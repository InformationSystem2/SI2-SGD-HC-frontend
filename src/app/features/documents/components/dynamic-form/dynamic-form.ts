import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFloppyDisk,
  faPlus,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { UiSchema, FieldConfig, FieldType } from '../../models/document.model';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './dynamic-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements OnInit {

  private fb = inject(FormBuilder);

  readonly uiSchema   = input.required<UiSchema>();
  readonly submitting = input(false);
  readonly submitted  = output<Record<string, unknown>>();

  readonly faFloppyDisk = faFloppyDisk;
  readonly faSpinner    = faSpinner;
  readonly faPlus       = faPlus;
  readonly faTrash      = faTrash;

  form!: FormGroup;

  /** Pares [fieldName, FieldConfig] ordenados por FieldConfig.order */
  fields: [string, FieldConfig][] = [];

  readonly FieldType = FieldType;

  ngOnInit(): void {
    this.fields = Object.entries(this.uiSchema())
      .sort(([, a], [, b]) => a.order - b.order);

    const controls: Record<string, unknown> = {};
    for (const [name, cfg] of this.fields) {
      if (cfg.type === FieldType.DISPLAY_TEXT) continue;

      if (cfg.type === FieldType.ARRAY) {
        // FormArray que inicia con una fila vacía
        controls[name] = this.fb.array([this.buildArrayRow(cfg)]);
      } else {
        const validators = cfg.required ? [Validators.required] : [];
        controls[name] = [cfg.type === FieldType.CHECKBOX ? false : '', validators];
      }
    }

    this.form = this.fb.group(controls);
  }

  // ── ARRAY helpers ────────────────────────────────────────────────────────────

  /** Crea un FormGroup con un control por cada columna del subSchema */
  buildArrayRow(cfg: FieldConfig): FormGroup {
    const subCols = Object.entries(cfg.subSchema ?? {})
      .sort(([, a], [, b]) => a.order - b.order);
    const group: Record<string, unknown[]> = {};
    for (const [colName, colCfg] of subCols) {
      group[colName] = [
        colCfg.type === FieldType.CHECKBOX ? false : '',
        colCfg.required ? [Validators.required] : []
      ];
    }
    return this.fb.group(group);
  }

  /** Devuelve el FormArray de un campo ARRAY */
  getFormArray(fieldName: string): FormArray {
    return this.form.get(fieldName) as FormArray;
  }

  /** Devuelve filas del FormArray como FormGroup[] */
  getArrayRows(fieldName: string): FormGroup[] {
    return this.getFormArray(fieldName).controls as FormGroup[];
  }

  /** Agrega una fila al FormArray */
  addRow(fieldName: string, cfg: FieldConfig): void {
    this.getFormArray(fieldName).push(this.buildArrayRow(cfg));
  }

  /** Elimina una fila del FormArray */
  removeRow(fieldName: string, index: number): void {
    const arr = this.getFormArray(fieldName);
    if (arr.length > 1) arr.removeAt(index);
  }

  /** Columnas ordenadas del subSchema */
  getSubCols(cfg: FieldConfig): [string, FieldConfig][] {
    return Object.entries(cfg.subSchema ?? {})
      .sort(([, a], [, b]) => a.order - b.order);
  }

  /** Tipo de input para una columna del subSchema */
  getSubInputType(colCfg: FieldConfig): string {
    return this.getInputType(colCfg);
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  // ── Scalar helpers ───────────────────────────────────────────────────────────

  /** Devuelve las entradas [key, label] de las opciones de un campo SELECT/RADIO */
  getOptions(cfg: FieldConfig): [string, string][] {
    return Object.entries(cfg.options ?? {});
  }

  /** Devuelve el tipo de <input> HTML según FieldConfig.type */
  getInputType(cfg: FieldConfig): string {
    switch (cfg.type) {
      case FieldType.NUMBER:   return 'number';
      case FieldType.EMAIL:    return 'email';
      case FieldType.DATE:     return 'date';
      case FieldType.TIME:     return 'time';
      case FieldType.FILE:     return 'file';
      default:                 return 'text';
    }
  }

  /** Tipos que se renderizan con un <input> estándar */
  isStandardInput(cfg: FieldConfig): boolean {
    return ![
      FieldType.TEXTAREA,
      FieldType.SELECT,
      FieldType.RADIO,
      FieldType.CHECKBOX,
      FieldType.DISPLAY_TEXT,
      FieldType.ARRAY,
    ].includes(cfg.type);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value as Record<string, unknown>);
  }
}
