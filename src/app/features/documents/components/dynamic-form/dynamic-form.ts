import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faSpinner } from '@fortawesome/free-solid-svg-icons';
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

  form!: FormGroup;

  /** Pares [fieldName, FieldConfig] ordenados por FieldConfig.order */
  fields: [string, FieldConfig][] = [];

  readonly FieldType = FieldType;

  ngOnInit(): void {
    this.fields = Object.entries(this.uiSchema())
      .sort(([, a], [, b]) => a.order - b.order);

    const controls: Record<string, unknown[]> = {};
    for (const [name, cfg] of this.fields) {
      if (cfg.type === FieldType.DISPLAY_TEXT) continue;
      const validators = cfg.required ? [Validators.required] : [];
      controls[name] = [cfg.type === FieldType.CHECKBOX ? false : '', validators];
    }

    this.form = this.fb.group(controls);
  }

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
    ].includes(cfg.type);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value as Record<string, unknown>);
  }
}
