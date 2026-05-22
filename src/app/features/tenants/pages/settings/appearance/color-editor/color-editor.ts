import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IdentityPresets } from '../identity.presets';
import { hexToRgb, rgbToHex, RGB } from '../../../../../../core/utils/color.utils';

interface ColorToken {
  key: string;
  label: string;
  category: 'primary' | 'neutral' | 'state' | 'text';
  description?: string;
}

type ColorsMap = Record<string, string>;
type DualColors = { light: ColorsMap; dark: ColorsMap };

@Component({
  selector: 'app-color-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './color-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorEditorComponent {
  readonly colors = input.required<ColorsMap>();
  readonly selectedPresetId = input.required<string>();
  readonly editingColorKey = input<string | null>(null);
  readonly editingColorHex = input<string>('');
  readonly editingColorRgb = input<RGB>({ r: 0, g: 0, b: 0 });
  readonly themeMode = input<'light' | 'dark'>('light');

  readonly presets = IdentityPresets.getAllPresets();

  readonly colorTokens = signal<ColorToken[]>([
    { key: 'primary', label: 'IDENTITY.COLOR_PRIMARY', category: 'primary', description: 'IDENTITY.COLOR_PRIMARY_DESC' },
    { key: 'primaryDark', label: 'IDENTITY.COLOR_PRIMARY_DARK', category: 'primary', description: 'IDENTITY.COLOR_PRIMARY_DARK_DESC' },
    { key: 'primaryLight', label: 'IDENTITY.COLOR_PRIMARY_LIGHT', category: 'primary', description: 'IDENTITY.COLOR_PRIMARY_LIGHT_DESC' },
    { key: 'accent', label: 'IDENTITY.COLOR_ACCENT', category: 'primary', description: 'IDENTITY.COLOR_ACCENT_DESC' },
    { key: 'background', label: 'IDENTITY.COLOR_BACKGROUND', category: 'neutral', description: 'IDENTITY.COLOR_BACKGROUND_DESC' },
    { key: 'surface', label: 'IDENTITY.COLOR_SURFACE', category: 'neutral', description: 'IDENTITY.COLOR_SURFACE_DESC' },
    { key: 'sidebar', label: 'IDENTITY.COLOR_SIDEBAR', category: 'neutral', description: 'IDENTITY.COLOR_SIDEBAR_DESC' },
    { key: 'navbar', label: 'IDENTITY.COLOR_NAVBAR', category: 'neutral', description: 'IDENTITY.COLOR_NAVBAR_DESC' },
    { key: 'border', label: 'IDENTITY.COLOR_BORDER', category: 'neutral', description: 'IDENTITY.COLOR_BORDER_DESC' },
    { key: 'muted', label: 'IDENTITY.COLOR_MUTED', category: 'neutral', description: 'IDENTITY.COLOR_MUTED_DESC' },
    { key: 'hover', label: 'IDENTITY.COLOR_HOVER', category: 'neutral', description: 'IDENTITY.COLOR_HOVER_DESC' },
    { key: 'card', label: 'IDENTITY.COLOR_CARD', category: 'neutral', description: 'IDENTITY.COLOR_CARD_DESC' },
    { key: 'input', label: 'IDENTITY.COLOR_INPUT', category: 'neutral', description: 'IDENTITY.COLOR_INPUT_DESC' },
    { key: 'success', label: 'IDENTITY.COLOR_SUCCESS', category: 'state', description: 'IDENTITY.COLOR_SUCCESS_DESC' },
    { key: 'successBg', label: 'IDENTITY.COLOR_SUCCESS_BG', category: 'state', description: 'IDENTITY.COLOR_SUCCESS_BG_DESC' },
    { key: 'warning', label: 'IDENTITY.COLOR_WARNING', category: 'state', description: 'IDENTITY.COLOR_WARNING_DESC' },
    { key: 'warningBg', label: 'IDENTITY.COLOR_WARNING_BG', category: 'state', description: 'IDENTITY.COLOR_WARNING_BG_DESC' },
    { key: 'error', label: 'IDENTITY.COLOR_ERROR', category: 'state', description: 'IDENTITY.COLOR_ERROR_DESC' },
    { key: 'errorBg', label: 'IDENTITY.COLOR_ERROR_BG', category: 'state', description: 'IDENTITY.COLOR_ERROR_BG_DESC' },
    { key: 'info', label: 'IDENTITY.COLOR_INFO', category: 'state', description: 'IDENTITY.COLOR_INFO_DESC' },
    { key: 'infoBg', label: 'IDENTITY.COLOR_INFO_BG', category: 'state', description: 'IDENTITY.COLOR_INFO_BG_DESC' },
    { key: 'textPrimary', label: 'IDENTITY.COLOR_TEXT_PRIMARY', category: 'text', description: 'IDENTITY.COLOR_TEXT_PRIMARY_DESC' },
    { key: 'textSecondary', label: 'IDENTITY.COLOR_TEXT_SECONDARY', category: 'text', description: 'IDENTITY.COLOR_TEXT_SECONDARY_DESC' },
    { key: 'textMuted', label: 'IDENTITY.COLOR_TEXT_MUTED_LABEL', category: 'text', description: 'IDENTITY.COLOR_TEXT_MUTED_DESC' },
    { key: 'onPrimary', label: 'IDENTITY.COLOR_ON_PRIMARY', category: 'text', description: 'IDENTITY.COLOR_ON_PRIMARY_DESC' },
  ]);

  readonly presetSelected = output<string>();
  readonly colorChange = output<Record<string, string>>();
  readonly editColor = output<ColorToken>();
  readonly applyColor = output<string>();
  readonly cancelEdit = output<void>();
  readonly rgbChange = output<RGB>();
  readonly hexChange = output<string>();

  getColorValue(key: string): string {
    return this.colors()[key] || '#000000';
  }

  getColorTokensByCategory(category: string): ColorToken[] {
    return this.colorTokens().filter(t => t.category === category);
  }

  onSelectPreset(presetId: string) {
    this.presetSelected.emit(presetId);
  }

  onStartEditColor(token: ColorToken) {
    this.editColor.emit(token);
  }

  onApplyColor() {
    this.applyColor.emit(this.editingColorHex());
  }

  onCancelEdit() {
    this.cancelEdit.emit();
  }

  onRgbChange(channel: 'r' | 'g' | 'b', value: number) {
    const current = this.editingColorRgb();
    this.rgbChange.emit({ ...current, [channel]: value });
  }

  onHexChange(hex: string) {
    this.hexChange.emit(hex);
  }
}