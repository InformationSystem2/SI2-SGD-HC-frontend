import { Injectable, signal } from '@angular/core';

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TENANT_SLUG_KEY = 'tenantSlug';
  private readonly TENANT_NAME_KEY = 'tenant_name_cache';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';

  private readonly _tenantSlug = signal<string>('');

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const slug = localStorage.getItem(this.TENANT_SLUG_KEY) || '';
    this._tenantSlug.set(slug);
  }

  getTenantSlug(): string {
    if (this._tenantSlug()) return this._tenantSlug();
    if (typeof localStorage === 'undefined') return '';
    const slug = localStorage.getItem(this.TENANT_SLUG_KEY) || '';
    this._tenantSlug.set(slug);
    return slug;
  }

  setTenantSlug(slug: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TENANT_SLUG_KEY, slug);
    }
    this._tenantSlug.set(slug);
  }

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  removeAccessToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  getTenantName(): string {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem(this.TENANT_NAME_KEY) || '';
  }

  setTenantName(name: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TENANT_NAME_KEY, name);
    }
  }

  clearTenantData(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.TENANT_SLUG_KEY);
    localStorage.removeItem(this.TENANT_NAME_KEY);
    this._tenantSlug.set('');
  }

  getItem<T = string>(key: string, parser?: (raw: string) => T): T | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (parser) return parser(raw);
    return raw as unknown as T;
  }

  setItem<T = string>(key: string, value: T, serializer?: (value: T) => string): void {
    if (typeof localStorage === 'undefined') return;
    const serialized = serializer ? serializer(value) : String(value);
    localStorage.setItem(key, serialized);
  }

  removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  getTenantSlugFromToken(token?: string | null): string {
    const t = token || this.getAccessToken();
    if (!t) return '';
    const payload = decodeJwt(t);
    return payload?.tenantSlug || '';
  }
}