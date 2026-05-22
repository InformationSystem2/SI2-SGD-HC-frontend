import { hexToRgb, rgbToHex, darken, lighten, mix, luminance, getOnPrimary } from '../../../../../core/utils/color.utils';

export type ThemeMode = 'light' | 'dark';

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

const BASE_COLORS = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

const makePreset = (
  id: string, name: string, description: string, icon: string,
  primary: string,
  light: { bg: string; surface: string; border: string; muted: string; hover?: string; sidebar?: string; navbar?: string },
  dark: { bg: string; surface: string; border: string; muted: string; hover?: string; sidebar?: string; navbar?: string }
): Preset => {
  const lightOnBg = luminance(light.bg) > 0.5 ? '#0F172A' : '#F8FAFC';
  const darkOnBg = luminance(dark.bg) > 0.5 ? '#0F172A' : '#F8FAFC';
  
  // Usar mix para combinar texto principal y fondo
  const lightSecondary = mix(lightOnBg, light.bg, 0.70);
  const lightMutedText = mix(lightOnBg, light.bg, 0.50);
  const darkSecondary = mix(darkOnBg, dark.bg, 0.70);
  const darkMutedText = mix(darkOnBg, dark.bg, 0.50);

  return {
    id, name, description, icon,
    colors: {
      light: {
        primary,
        primaryDark: darken(primary, 0.15),
        primaryLight: lighten(primary, 0.35),
        accent: lighten(primary, 0.10),
        background: light.bg,
        surface: light.surface,
        border: light.border,
        muted: light.muted,
        hover: light.hover || mix(primary, light.surface, 0.15),
        sidebar: light.sidebar || mix(primary, light.surface, 0.05), // Ligeramente teñido por defecto
        navbar: light.navbar || light.surface,
        success: BASE_COLORS.success,
        warning: BASE_COLORS.warning,
        error: BASE_COLORS.error,
        textPrimary: lightOnBg,
        textSecondary: lightSecondary,
        textMuted: lightMutedText,
        onPrimary: getOnPrimary(primary),
        card: light.surface,
        input: light.muted,
        successBg: lighten(BASE_COLORS.success, 0.75),
        warningBg: lighten(BASE_COLORS.warning, 0.75),
        errorBg: lighten(BASE_COLORS.error, 0.75),
        info: '#3B82F6',
        infoBg: lighten('#3B82F6', 0.75)
      },
      dark: {
        primary,
        primaryDark: darken(primary, 0.10),
        primaryLight: lighten(primary, 0.25),
        accent: lighten(primary, 0.05),
        background: dark.bg,
        surface: dark.surface,
        border: dark.border,
        muted: dark.muted,
        hover: dark.hover || mix(primary, dark.surface, 0.15),
        sidebar: dark.sidebar || darken(dark.bg, 0.03), // Ligeramente más oscuro que el fondo
        navbar: dark.navbar || dark.bg,
        success: lighten(BASE_COLORS.success, 0.20),
        warning: lighten(BASE_COLORS.warning, 0.20),
        error: lighten(BASE_COLORS.error, 0.20),
        textPrimary: darkOnBg,
        textSecondary: darkSecondary,
        textMuted: darkMutedText,
        onPrimary: getOnPrimary(primary),
        card: lighten(dark.surface, 0.03),
        input: darken(dark.surface, 0.02),
        successBg: darken(BASE_COLORS.success, 0.40),
        warningBg: darken(BASE_COLORS.warning, 0.40),
        errorBg: darken(BASE_COLORS.error, 0.40),
        info: lighten('#3B82F6', 0.20),
        infoBg: darken('#3B82F6', 0.40)
      }
    }
  };
};

export const PRESETS: Preset[] = [
  makePreset(
    'teal', 'IDENTITY_PRESETS.TEAL', 'IDENTITY_PRESETS.TEAL_DESC',
    '💚', '#0D9488',
    { bg: '#F8FAFC', surface: '#FFFFFF', border: '#E2E8F0', muted: '#F1F5F9', hover: '#CCFBF1', sidebar: '#F0FDFA', navbar: '#FFFFFF' },
    { bg: '#0B1220', surface: '#0D1829', border: '#1E3352', muted: '#1A2D47', hover: '#1E3455', sidebar: '#0F1A2E', navbar: '#0F1A2E' }
  ),
  makePreset(
    'blue', 'IDENTITY_PRESETS.BLUE', 'IDENTITY_PRESETS.BLUE_DESC',
    '💙', '#0284C7',
    { bg: '#F0F9FF', surface: '#FFFFFF', border: '#BAE6FD', muted: '#E0F2FE', hover: '#BAE6FD', sidebar: '#F0F9FF', navbar: '#FFFFFF' },
    { bg: '#0C1A2E', surface: '#0F2240', border: '#1D3A5F', muted: '#162D4A', hover: '#1D3A5F', sidebar: '#0A1526', navbar: '#0C1A2E' }
  ),
  makePreset(
    'indigo', 'IDENTITY_PRESETS.INDIGO', 'IDENTITY_PRESETS.INDIGO_DESC',
    '💠', '#4F46E5',
    { bg: '#FAFAFE', surface: '#FFFFFF', border: '#C7D2FE', muted: '#EEF2FF', hover: '#C7D2FE', sidebar: '#F5F3FF', navbar: '#FFFFFF' },
    { bg: '#0D0F1E', surface: '#121526', border: '#252B4A', muted: '#1A1E36', hover: '#252B4A', sidebar: '#0A0C18', navbar: '#0D0F1E' }
  ),
  makePreset(
    'emerald', 'IDENTITY_PRESETS.EMERALD', 'IDENTITY_PRESETS.EMERALD_DESC',
    '💚', '#059669',
    { bg: '#F0FDF4', surface: '#FFFFFF', border: '#A7F3D0', muted: '#DCFCE7', hover: '#A7F3D0', sidebar: '#ECFDF5', navbar: '#FFFFFF' },
    { bg: '#0A1F14', surface: '#0D2818', border: '#14532D', muted: '#0F2016', hover: '#14532D', sidebar: '#08170F', navbar: '#0A1F14' }
  ),
  makePreset(
    'sky', 'IDENTITY_PRESETS.SKY', 'IDENTITY_PRESETS.SKY_DESC',
    '🌤️', '#0EA5E9',
    { bg: '#F0F9FF', surface: '#FFFFFF', border: '#BAE6FD', muted: '#E0F2FE', hover: '#BAE6FD', sidebar: '#F0F9FF', navbar: '#FFFFFF' },
    { bg: '#0B1420', surface: '#0E1E2E', border: '#164460', muted: '#0F1A28', hover: '#164460', sidebar: '#09101A', navbar: '#0B1420' }
  ),
  makePreset(
    'slate', 'IDENTITY_PRESETS.SLATE', 'IDENTITY_PRESETS.SLATE_DESC',
    '🏥', '#475569',
    { bg: '#F8FAFC', surface: '#FFFFFF', border: '#CBD5E1', muted: '#F1F5F9', hover: '#E2E8F0', sidebar: '#F1F5F9', navbar: '#FFFFFF' },
    { bg: '#0B1220', surface: '#0D1829', border: '#1E3352', muted: '#1A2D47', hover: '#334155', sidebar: '#090F1A', navbar: '#0B1220' }
  ),
];

export class IdentityPresets {
  static getAllPresets(): Preset[] {
    return PRESETS;
  }

  static getPresetColors(presetId: string, mode: ThemeMode): Record<string, string> {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return PRESETS[0].colors[mode];
    return preset.colors[mode];
  }

  static getPresetById(id: string): Preset | undefined {
    return PRESETS.find(p => p.id === id);
  }
}