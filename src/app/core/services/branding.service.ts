import { inject, Injectable, signal, effect, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type ColorsMap = Record<string, string>;

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'tenant_branding';
const TENANT_NAME_KEY = 'tenant_name_cache';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);

  readonly branding = signal<any>(null);
  readonly tenantName = signal<string>('');
  readonly clinicName = computed(() => {
    const b = this.branding();
    return this.tenantName() || 'DOCUSALUD';
  });
  private normalizeUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      return `${baseUrl}${url}`;
    }
    return url;
  }

  readonly clinicLogo = computed(() => {
    const b = this.branding();
    if (!b) return '';
    let url = '';
    if (b.logo_url) url = b.logo_url;
    else if (b.branding?.logo_url) url = b.branding.logo_url;
    else if (b.branding?.assets?.logo?.light) url = b.branding.assets.logo.light;
    return this.normalizeUrl(url);
  });

  private getAuthToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private loadTenantInfo(token: string, tenantSlug: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantSlug
    });
    this.http.get<any>(`${environment.apiUrl}/tenants/current/info`, { headers }).subscribe({
      next: (info) => {
        const name = info.name || '';
        this.tenantName.set(name);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TENANT_NAME_KEY, name);
        }
      },
      error: () => { }
    });
  }

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const cachedName = localStorage.getItem(TENANT_NAME_KEY);
      if (cachedName) this.tenantName.set(cachedName);
      
      const cachedBranding = this.loadFromCache();
      if (cachedBranding) this.branding.set(this.normalizeBrandingResponse(cachedBranding));
    }

    const token = this.getAuthToken();
    if (token) {
      const payload = decodeJwt(token);
      const tenantSlug = payload?.tenantSlug || '';
      this.load(token, tenantSlug);
    }
    effect(() => {
      const b = this.branding();
      this.applyBranding(b);
    });
  }

  private loadFromCache(): any | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveToCache(b: any) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    } catch {
      console.warn('Failed to cache branding');
    }
  }

  load(token?: string, tenantSlug?: string) {
    const authToken = token || this.getAuthToken();
    if (!authToken) return;

    const slug = tenantSlug || (() => {
      const payload = decodeJwt(authToken);
      return payload?.tenantSlug || '';
    })();

    this.loadTenantInfo(authToken, slug);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': slug
    });

    this.http.get<any>(`${environment.apiUrl}/branding`, { headers }).subscribe({
      next: (res) => {
        const normalized = this.normalizeBrandingResponse(res);
        this.branding.set(normalized);
        this.saveToCache(normalized);
      },
      error: (err) => {
        console.warn('[BrandingService] load() failed:', err.status, err.statusText);
        const cached = this.loadFromCache();
        if (cached) {
          this.branding.set(this.normalizeBrandingResponse(cached));
        } else {
          this.branding.set(null);
        }
      }
    });
  }

  private normalizeBrandingResponse(res: any): any {
    if (!res) return null;
    if (res.branding?.branding) {
      return res.branding.branding;
    }
    if (res.branding) {
      return res.branding;
    }
    return res;
  }

  private applyBranding(b: any) {
    try {
      if (!b) return;
      const tokens = b?.tokens || b?.branding?.tokens || {};
      const colors = tokens.colors || {};
      const typography = tokens.typography || {};
      const components = tokens.components || {};

      // Detect if we have dual colors
      if (colors.light && colors.dark) {
        this.applyDualBrandingCss(colors, typography);
        return;
      }

      const colorKeyMap: Record<string, string> = {
        primary: 'primary',
        primaryDark: 'primary-dark',
        primaryLight: 'primary-light',
        accent: 'accent',
        background: 'bg-app',
        surface: 'bg-surface',
        card: 'bg-card',
        input: 'bg-input',
        sidebar: 'bg-sidebar',
        navbar: 'bg-navbar',
        border: 'border',
        muted: 'bg-muted',
        hover: 'bg-hover',
        success: 'success',
        successBg: 'success-bg',
        warning: 'warning',
        warningBg: 'warning-bg',
        error: 'error',
        errorBg: 'error-bg',
        info: 'info',
        infoBg: 'info-bg',
        textPrimary: 'text-primary',
        textSecondary: 'text-secondary',
        textMuted: 'text-muted',
        onPrimary: 'on-primary'
      };

      let css = ':root {';
      for (const [k, v] of Object.entries(colors)) {
        if (typeof v === 'string') {
          const cssKey = colorKeyMap[k] || k.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `--hc-${cssKey}: ${v};`;
        }
      }

      if (typography.fontFamily) {
        css += `--hc-font-family: ${typography.fontFamily}, sans-serif;`;
        css += `--hc-base-font-size: ${typography.baseSize || 16}px;`;
        css += `--hc-heading-weight: ${typography.headingWeight || 700};`;
        css += `--hc-line-height: ${typography.lineHeight || 1.5};`;
        css += `--hc-letter-spacing: ${typography.letterSpacing || 0}px;`;
        if (typography.h1Size) css += `--hc-h1-size: ${typography.h1Size}rem;`;
        if (typography.h2Size) css += `--hc-h2-size: ${typography.h2Size}rem;`;
        if (typography.h3Size) css += `--hc-h3-size: ${typography.h3Size}rem;`;
        if (typography.h4Size) css += `--hc-h4-size: ${typography.h4Size}rem;`;
        if (typography.h5Size) css += `--hc-h5-size: ${typography.h5Size}rem;`;
        if (typography.h6Size) css += `--hc-h6-size: ${typography.h6Size}rem;`;

        this.loadFont(typography.fontFamily);
      }

      if (components.borderRadius !== undefined) {
        css += `--hc-radius: ${components.borderRadius}px;`;
        css += `--hc-radius-sm: ${Math.max(2, components.borderRadius * 0.5)}px;`;
        css += `--hc-radius-md: ${components.borderRadius}px;`;
        css += `--hc-radius-lg: ${Math.min(24, components.borderRadius * 1.5)}px;`;
        css += `--hc-radius-xl: ${Math.min(32, components.borderRadius * 2)}px;`;
      }
      if (components.shadow) {
        const shadowMap: Record<string, string> = {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        };
        css += `--hc-shadow: ${shadowMap[components.shadow] ?? shadowMap['md']};`;
      }
      if (components.spacing !== undefined) {
        css += `--hc-spacing-unit: ${components.spacing}px;`;
      }

      css += '}';
      css += `html { font-size: ${typography.baseSize || 16}px; }`;
      css += `body { font-family: var(--hc-font-family, 'Inter', sans-serif); }`;

      let style = document.getElementById('tenant-theme') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = 'tenant-theme';
        document.head.appendChild(style);
      }
      style.textContent = css;
    } catch (e) {
      console.warn('[BrandingService] applyBranding failed:', e);
    }
  }

  applyBrandingDirect(colors: any, typography: any, components: any, identity?: any) {
    const existing = this.branding();
    const fullBranding = {
      ...existing,
      identity,
      tokens: { colors, typography, components }
    };
    this.branding.set(fullBranding);
    this.applyBranding(fullBranding);
  }

  applyDualBranding(dualColors: { light: any; dark: any }, typography: any, components: any) {
    const existing = this.branding();
    const fullBranding = {
      ...existing,
      tokens: { colors: dualColors, typography, components }
    };
    this.branding.set(fullBranding);
    this.applyDualBrandingCss(dualColors, typography);
  }

  private applyDualBrandingCss(dualColors: { light: ColorsMap; dark: ColorsMap }, typography: any) {
    try {
      const colorKeyMap: Record<string, string> = {
        primary: 'primary',
        primaryDark: 'primary-dark',
        primaryLight: 'primary-light',
        accent: 'accent',
        background: 'bg-app',
        surface: 'bg-surface',
        card: 'bg-card',
        input: 'bg-input',
        sidebar: 'bg-sidebar',
        navbar: 'bg-navbar',
        border: 'border',
        muted: 'bg-muted',
        hover: 'bg-hover',
        success: 'success',
        successBg: 'success-bg',
        warning: 'warning',
        warningBg: 'warning-bg',
        error: 'error',
        errorBg: 'error-bg',
        info: 'info',
        infoBg: 'info-bg',
        textPrimary: 'text-primary',
        textSecondary: 'text-secondary',
        textMuted: 'text-muted',
        onPrimary: 'on-primary'
      };

      const buildCssForMode = (mode: 'light' | 'dark', colors: Record<string, string>) => {
        let css = '';
        for (const [k, v] of Object.entries(colors)) {
          if (typeof v === 'string') {
            const cssKey = colorKeyMap[k] || k.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `--hc-${cssKey}: ${v};`;
          }
        }
        return css;
      };

      const lightCss = buildCssForMode('light', dualColors.light);
      const darkCss = buildCssForMode('dark', dualColors.dark);

      const typographyCss = typography?.fontFamily ? `
        --hc-font-family: ${typography.fontFamily}, sans-serif;
        --hc-base-font-size: ${typography.baseSize || 16}px;
        --hc-heading-weight: ${typography.headingWeight || 700};
        --hc-line-height: ${typography.lineHeight || 1.5};
        --hc-letter-spacing: ${typography.letterSpacing || 0}px;
        ${typography.h1Size ? `--hc-h1-size: ${typography.h1Size}rem;` : ''}
        ${typography.h2Size ? `--hc-h2-size: ${typography.h2Size}rem;` : ''}
        ${typography.h3Size ? `--hc-h3-size: ${typography.h3Size}rem;` : ''}
        ${typography.h4Size ? `--hc-h4-size: ${typography.h4Size}rem;` : ''}
        ${typography.h5Size ? `--hc-h5-size: ${typography.h5Size}rem;` : ''}
        ${typography.h6Size ? `--hc-h6-size: ${typography.h6Size}rem;` : ''}
      ` : '';

      const css = `
        :root { ${lightCss} ${typographyCss} }
        .dark { ${darkCss} ${typographyCss} }
        html { font-size: ${typography?.baseSize || 16}px; }
        body { font-family: var(--hc-font-family, 'Inter', sans-serif); }
      `.replace(/\s+/g, ' ').trim();

      let style = document.getElementById('tenant-theme') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = 'tenant-theme';
        document.head.appendChild(style);
      }
      style.textContent = css;

      if (typography?.fontFamily) {
        this.loadFont(typography.fontFamily);
      }
    } catch (e) {
      console.warn('[BrandingService] applyDualBrandingCss failed:', e);
    }
  }

  private loadFont(fontFamily: string) {
    if (!fontFamily || fontFamily === 'Inter' || fontFamily === 'system-ui') return;
    const id = 'hc-dynamic-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }

  uploadLogoUrl(file: File): any {
    const token = this.getAuthToken();
    if (!token) return;
    const slug = this.getTenantSlug(token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': slug
    });
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/branding/logo`, formData, { headers });
  }

  private getTenantSlug(token: string): string {
    const payload = decodeJwt(token);
    return payload?.tenantSlug || '';
  }
}