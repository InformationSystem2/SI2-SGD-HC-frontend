import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BrandingService } from '../../../../../core/services/branding.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { StorageService } from '../../../../../core/services/storage.service';
import { IdentityPresets, ThemeMode } from './identity.presets';
import { environment } from '../../../../../../environments/environment';
import { hexToRgb, rgbToHex, getContrastColor, RGB } from '../../../../../core/utils/color.utils';
import { ColorEditorComponent } from './color-editor/color-editor';
import { TypographyEditorComponent } from './typography-editor/typography-editor';
import { AppearancePreviewComponent } from './appearance-preview/appearance-preview';

interface ColorToken {
  key: string;
  label: string;
  category: 'primary' | 'neutral' | 'state' | 'text';
  description?: string;
}

type ColorsMap = Record<string, string>;
type DualColors = { light: ColorsMap; dark: ColorsMap };

const DEFAULT_LIGHT_COLORS: ColorsMap = {
  primary: '#0D9488', primaryDark: '#0B7E74', primaryLight: '#5EC8BF',
  accent: '#259F94', background: '#F8FAFC', surface: '#FFFFFF',
  sidebar: '#F0FDFA', navbar: '#FFFFFF', border: '#E2E8F0',
  muted: '#F1F5F9', hover: '#CCFBF1', success: '#10B981',
  warning: '#F59E0B', error: '#EF4444', textPrimary: '#0F172A',
  textSecondary: '#616673', textMuted: '#8F949E', onPrimary: '#FFFFFF',
  card: '#FFFFFF', input: '#FFFFFF', successBg: '#ECFDF5',
  warningBg: '#FFFBEB', errorBg: '#FEF2F2', info: '#3B82F6', infoBg: '#EFF6FF'
};

const DEFAULT_DARK_COLORS: ColorsMap = {
  primary: '#0D9488', primaryDark: '#0C857A', primaryLight: '#7FC4BC',
  accent: '#1A8F85', background: '#0B1220', surface: '#0D1829',
  sidebar: '#0F1A2E', navbar: '#0F1A2E', border: '#1E3352',
  muted: '#1A2D47', hover: '#1E3455', success: '#18C78F',
  warning: '#FFB020', error: '#FF6B6B', textPrimary: '#F8FAFC',
  textSecondary: '#B1B4BA', textMuted: '#82868E', onPrimary: '#FFFFFF',
  card: '#131F35', input: '#162540', successBg: '#052E16',
  warningBg: '#451A03', errorBg: '#450A0A', info: '#60A5FA', infoBg: '#1E3A8A'
};

interface AppState {
  colors: DualColors;
  typography: {
    fontFamily: string;
    baseSize: number;
    headingWeight: number;
    lineHeight: number;
    letterSpacing: number;
    h1Size: number;
    h2Size: number;
    h3Size: number;
    h4Size: number;
    h5Size: number;
    h6Size: number;
  };
}

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    ColorEditorComponent,
    TypographyEditorComponent,
    AppearancePreviewComponent
  ],
  templateUrl: './appearance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Appearance implements OnInit {
  private http = inject(HttpClient);
  private brandingService = inject(BrandingService);
  private themeService = inject(ThemeService);
  private storageService = inject(StorageService);
  protected translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  activeSection = signal<'colors' | 'typography'>('colors');
  themeMode = signal<ThemeMode>('light');
  selectedPresetId = signal<string>('teal');
  state = signal<AppState>({
    colors: { light: DEFAULT_LIGHT_COLORS, dark: DEFAULT_DARK_COLORS },
    typography: {
      fontFamily: 'Inter', baseSize: 16, headingWeight: 700, lineHeight: 1.5,
      letterSpacing: 0, h1Size: 2.5, h2Size: 2, h3Size: 1.5,
      h4Size: 1.25, h5Size: 1, h6Size: 0.875
    }
  });
  historyStack = signal<any[]>([]);
  historyIndex = signal(-1);
  autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  autoSaveEnabled = signal(true);
  lastSaved = signal<Date | null>(null);
  hasUnsavedChanges = signal(false);
  loadedFonts = signal<Set<string>>(new Set(['Inter']));
  tenantName = signal('');
  editingColorKey = signal<string | null>(null);
  editingColorHex = signal('');
  editingColorRgb = signal<RGB>({ r: 0, g: 0, b: 0 });

  get colors() { return this.state().colors[this.themeMode()]; }
  get typography() { return this.state().typography; }

  ngOnInit() {
    this.loadBranding();
  }

  loadBranding() {
    this.loading.set(true);
    const tenantSlug = this.storageService.getTenantSlug();
    const headers = new HttpHeaders({ 'X-Tenant-ID': tenantSlug });

    this.http.get<any>(`${environment.apiUrl}/branding`, { headers }).subscribe({
      next: (res) => {
        const branding = res?.branding || res || {};
        const tokens = branding.tokens || {};
        const colors = tokens.colors || {};
        const typography = tokens.typography || {};

        let dualColors: DualColors;
        if (colors.light && colors.dark) {
          dualColors = colors as DualColors;
        } else {
          const flatColors = colors as ColorsMap;
          const keyMap: Record<string, string> = { app: 'background', card: 'surface', input: 'surface' };
          const normalized: ColorsMap = {};
          for (const [k, v] of Object.entries(flatColors)) {
            normalized[keyMap[k] || k] = v as string;
          }
          dualColors = {
            light: { ...DEFAULT_LIGHT_COLORS, ...normalized },
            dark: { ...DEFAULT_DARK_COLORS, ...normalized }
          };
        }

        this.state.set({
          colors: dualColors,
          typography: {
            fontFamily: typography.fontFamily || 'Inter',
            baseSize: typography.baseSize || 16,
            headingWeight: typography.headingWeight || 700,
            lineHeight: typography.lineHeight ?? 1.5,
            letterSpacing: typography.letterSpacing ?? 0,
            h1Size: typography.h1Size ?? 2.5,
            h2Size: typography.h2Size ?? 2,
            h3Size: typography.h3Size ?? 1.5,
            h4Size: typography.h4Size ?? 1.25,
            h5Size: typography.h5Size ?? 1,
            h6Size: typography.h6Size ?? 0.875
          }
        });

        const lightColors = dualColors.light;
        this.detectCurrentPreset(lightColors);
        const font = typography.fontFamily || 'Inter';
        this.loadFont(font);
        this.loadedFonts.update(s => { const n = new Set(s); n.add(font); return n; });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });

    this.tenantName.set(this.brandingService.tenantName() || this.translate.instant('IDENTITY.MY_CLINIC'));
  }

  detectCurrentPreset(colors: Record<string, string>) {
    const primary = colors['primary']?.toUpperCase() || '#0D9488'.toUpperCase();
    for (const preset of IdentityPresets.getAllPresets()) {
      const presetPrimary = (preset.colors.light['primary'] || '').toUpperCase();
      if (presetPrimary === primary) {
        this.selectedPresetId.set(preset.id);
        return;
      }
    }
    this.selectedPresetId.set('custom');
  }

  onPresetSelected(presetId: string) {
    this.selectedPresetId.set(presetId);
    const lightColors = IdentityPresets.getPresetColors(presetId, 'light') as ColorsMap;
    const darkColors = IdentityPresets.getPresetColors(presetId, 'dark') as ColorsMap;
    const dualColors: DualColors = { light: lightColors, dark: darkColors };
    const t = this.state().typography;
    this.pushState({ ...this.state(), colors: dualColors });
    this.brandingService.applyDualBranding(dualColors, t, undefined);
  }

  onColorChange(newColors: Record<string, string>) {
    const current = this.state().colors;
    const mode = this.themeMode();
    this.pushState({
      ...this.state(),
      colors: { ...current, [mode]: { ...current[mode], ...newColors } }
    });
  }

  onColorEditStart(token: ColorToken) {
    const hex = this.colors[token.key] || '#000000';
    const rgb = hexToRgb(hex);
    this.editingColorKey.set(token.key);
    this.editingColorHex.set(hex);
    this.editingColorRgb.set(rgb || { r: 0, g: 0, b: 0 });
  }

  onColorApply(hex: string) {
    const key = this.editingColorKey();
    if (key && hex) {
      const validHex = hex.startsWith('#') ? hex : '#' + hex;
      const current = this.state().colors;
      const mode = this.themeMode();
      this.pushState({
        ...this.state(),
        colors: { ...current, [mode]: { ...current[mode], [key]: validHex } }
      });
      this.editingColorKey.set(null);
      this.selectedPresetId.set('custom');
      this.brandingService.applyDualBranding(this.state().colors, this.state().typography, undefined);
    }
  }

  onColorCancel() {
    this.editingColorKey.set(null);
  }

  onRgbChange(rgb: RGB) {
    this.editingColorRgb.set(rgb);
    this.editingColorHex.set(rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  onHexChange(hex: string) {
    this.editingColorHex.set(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      this.editingColorRgb.set(rgb);
    }
  }

  onFontSelected(fontFamily: string) {
    this.loadFont(fontFamily);
    this.onTypographyChange({ field: 'fontFamily', value: fontFamily });
  }

  onTypographyChange(change: { field: string; value: number | string }) {
    this.pushState({
      ...this.state(),
      typography: { ...this.state().typography, [change.field]: change.value }
    });
    this.brandingService.applyDualBranding(this.state().colors, this.state().typography, undefined);
  }

  private pushState(newState: AppState) {
    const stack = this.historyStack();
    const idx = this.historyIndex();
    const truncated = stack.slice(0, idx + 1);
    truncated.push(JSON.parse(JSON.stringify(this.state())));
    if (truncated.length > 50) truncated.shift();
    this.historyStack.set(truncated);
    this.historyIndex.set(truncated.length - 1);
    this.state.set(newState);
    this.hasUnsavedChanges.set(true);
    this.scheduleAutoSave();
  }

  private scheduleAutoSave() {
    if (!this.autoSaveEnabled()) return;
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.save(true), 5000);
  }

  undo() {
    const idx = this.historyIndex();
    if (idx <= 0) return;
    this.historyIndex.set(idx - 1);
    this.state.set(JSON.parse(JSON.stringify(this.historyStack()[idx - 1])));
    this.hasUnsavedChanges.set(true);
  }

  redo() {
    const stack = this.historyStack();
    const idx = this.historyIndex();
    if (idx >= stack.length - 1) return;
    this.historyIndex.set(idx + 1);
    this.state.set(JSON.parse(JSON.stringify(stack[idx + 1])));
    this.hasUnsavedChanges.set(true);
  }

  get canUndo(): boolean { return this.historyIndex() > 0; }
  get canRedo(): boolean { return this.historyIndex() < this.historyStack().length - 1; }

  toggleTheme() {
    const newMode = this.themeMode() === 'light' ? 'dark' : 'light';
    this.themeMode.set(newMode);
  }

  save(isAuto = false) {
    if (!isAuto) this.saving.set(true);
    const tenantSlug = this.storageService.getTenantSlug();
    const headers = new HttpHeaders({ 'X-Tenant-ID': tenantSlug });
    const state = this.state();

    this.http.patch<any>(`${environment.apiUrl}/branding`, {
      tokens: {
        colors: state.colors,
        typography: state.typography
      }
    }, { headers }).subscribe({
      next: () => {
        this.saving.set(false);
        this.lastSaved.set(new Date());
        this.hasUnsavedChanges.set(false);
        this.brandingService.applyDualBranding(state.colors, state.typography, undefined);
        this.brandingService.load();
        if (!isAuto) this.showMessage(this.translate.instant('SUCCESS.CONFIG_SAVED'), 'success');
      },
      error: (err) => {
        this.saving.set(false);
        this.showMessage(err?.error?.message || this.translate.instant('ERRORS.ERROR_SAVE_CONFIG'), 'error');
      }
    });
  }

  resetToDefaults() {
    const dualColors: DualColors = { light: { ...DEFAULT_LIGHT_COLORS }, dark: { ...DEFAULT_DARK_COLORS } };
    const typography = { fontFamily: 'Inter', baseSize: 16, headingWeight: 700, lineHeight: 1.5, letterSpacing: 0, h1Size: 2.5, h2Size: 2, h3Size: 1.5, h4Size: 1.25, h5Size: 1, h6Size: 0.875 };
    this.state.set({
      ...this.state(),
      colors: dualColors,
      typography
    });
    this.brandingService.applyDualBranding(dualColors, typography, undefined);
    this.selectedPresetId.set('teal');
    this.showMessage(this.translate.instant('SUCCESS.RESTORED'), 'success');
  }

  exportConfig() {
    const state = this.state();
    const config = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tokens: { colors: state.colors, typography: state.typography }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appearance-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showMessage(this.translate.instant('SUCCESS.EXPORTED'), 'success');
  }

  importConfig(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (!config.version || !config.tokens?.colors) {
          this.showMessage(this.translate.instant('IDENTITY.INVALID_FILE'), 'error');
          return;
        }
        const importedColors = config.tokens.colors;
        let finalColors: DualColors;
        if (importedColors.light && importedColors.dark) {
          finalColors = importedColors as DualColors;
        } else {
          finalColors = { light: importedColors as ColorsMap, dark: importedColors as ColorsMap };
        }
        this.pushState({
          ...this.state(),
          colors: finalColors,
          typography: { ...this.state().typography, ...(config.tokens.typography || {}) }
        });
        this.selectedPresetId.set('custom');
        this.showMessage(this.translate.instant('SUCCESS.IMPORTED'), 'success');
      } catch {
        this.showMessage(this.translate.instant('IDENTITY.PARSE_ERROR'), 'error');
      }
    };
    reader.readAsText(input.files[0]);
    input.value = '';
  }

  setActiveSection(section: 'colors' | 'typography') {
    this.activeSection.set(section);
  }

  loadFont(fontFamily: string) {
    if (this.loadedFonts().has(fontFamily)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
    this.loadedFonts.update(s => { const n = new Set(s); n.add(fontFamily); return n; });
  }

  getLastSavedText(): string {
    const d = this.lastSaved();
    if (!d) return '';
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return this.translate.instant('IDENTITY.TIME_AGO_MOMENT');
    if (diff < 3600000) return this.translate.instant('IDENTITY.TIME_AGO_MINUTES', {min: Math.floor(diff / 60000)});
    return this.translate.instant('IDENTITY.TIME_AGO_HOURS', {hrs: Math.floor(diff / 3600000)});
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }

  goBack() {
    history.back();
  }
}