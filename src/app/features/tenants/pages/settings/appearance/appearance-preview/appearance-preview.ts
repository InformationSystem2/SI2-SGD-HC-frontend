import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { calculateContrastRatio, getContrastColor } from '../../../../../../core/utils/color.utils';

interface ColorsMap {
  [key: string]: string;
}

interface TypographyState {
  fontFamily: string;
  baseSize: number;
}

interface ContrastCheck {
  key: string;
  label: string;
  ratio: number;
  level: string;
}

@Component({
  selector: 'app-appearance-preview',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './appearance-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearancePreviewComponent {
  readonly colors = input.required<ColorsMap>();
  readonly typography = input.required<TypographyState>();
  readonly themeMode = input<'light' | 'dark'>('light');
  readonly tenantName = input<string>('');

  readonly contrastResults = computed<ContrastCheck[]>(() => {
    const c = this.colors();
    const checks: { key: string; label: string; fg: string; bg: string }[] = [
      { key: 'onPrimary', label: 'IDENTITY.CONTRAST_TEXT_ON_PRIMARY', fg: c['onPrimary'] || '#FFFFFF', bg: c['primary'] || '#0D9488' },
      { key: 'textOnBg', label: 'IDENTITY.CONTRAST_TEXT_ON_BG', fg: c['textPrimary'] || '#0F172A', bg: c['background'] || '#F8FAFC' },
      { key: 'textOnSurface', label: 'IDENTITY.CONTRAST_TEXT_ON_SURFACE', fg: c['textPrimary'] || '#0F172A', bg: c['surface'] || '#FFFFFF' },
      { key: 'successOnBg', label: 'IDENTITY.CONTRAST_SUCCESS_ON_BG', fg: c['success'] || '#22C55E', bg: c['background'] || '#F8FAFC' },
      { key: 'errorOnBg', label: 'IDENTITY.CONTRAST_ERROR_ON_BG', fg: c['error'] || '#EF4444', bg: c['background'] || '#F8FAFC' },
      { key: 'warningOnBg', label: 'IDENTITY.CONTRAST_WARNING_ON_BG', fg: c['warning'] || '#F59E0B', bg: c['background'] || '#F8FAFC' },
    ];

    return checks.map(check => {
      const ratio = calculateContrastRatio(check.fg, check.bg);
      let level = 'Fail';
      if (ratio >= 7) level = 'AAA';
      else if (ratio >= 4.5) level = 'AA';
      else if (ratio >= 3) level = 'AA Large';
      return { ...check, ratio, level };
    });
  });
}