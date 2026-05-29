import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthState, LoginRequest, LoginResponse } from '../models/auth.models';
import { BrandingService } from '../../services/branding.service';


@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private branding = inject(BrandingService);  

  private _state = signal<AuthState>((() => {
    const accessToken = localStorage.getItem('accessToken');
    const expiresAt   = Number(localStorage.getItem('expiresAt')) || null;
    let username: string | null = null;
    let roles: string[] | null  = null;
    let tenantId: string | null = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        username = payload.sub   ?? null;
        roles    = payload.roles ?? null;
        tenantId = payload.tenantId ?? null;
      } catch { /* token malformado */ }
    }
    return { accessToken, username, roles, tenantId, expiresAt, loading: false, error: null };
  })());

  readonly accessToken     = computed(() => this._state().accessToken);
  readonly isAuthenticated = computed(() => !!this._state().accessToken);
  readonly isLoading       = computed(() => this._state().loading);
  readonly error           = computed(() => this._state().error);
  readonly username        = computed(() => this._state().username);
  readonly roles           = computed(() => this._state().roles ?? []);
  readonly tenantId        = computed(() => this._state().tenantId);

  readonly isTokenExpired = computed(() => {
    const exp = this._state().expiresAt;
    if (!exp) return true;
    return Date.now() > exp;
  });

  hasPermission(permission: string): boolean {
    return this.roles().includes(permission);
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some(p => this.roles().includes(p));
  }

  login(credentials: LoginRequest) {
    this._state.update( s => ({ ...s, loading: true, error: null}));

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap( response => {

        const payload = this.decodeToken(response.accessToken);

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('tenantSlug', payload.tenantSlug || '');
        localStorage.setItem('expiresAt', String(Date.now() + response.expiresIn));

        this._state.set({
          accessToken: response.accessToken,
          username: payload.sub ?? null,
          roles: payload.roles ?? [],
          expiresAt: Date.now() + response.expiresIn,
          tenantId: payload.tenantId ?? null,
          loading: false,
          error: null,
        });

        this.branding.load();        
        this.router.navigate(['/dashboard']);
      }),
      catchError( err => {
        const message = err.error?.message ?? 'ERRORS.LOGIN_FAILED';
        this._state.update( s => ({ ...s, loading: false, error: message }));
        console.error('Login error:', err);
        return EMPTY;
      })
    );
  }



  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tenantSlug');
    localStorage.removeItem('expiresAt');
    this._state.set({
      accessToken: null,
      username: null,
      roles: null,
      expiresAt: null,
      tenantId: null,
      loading: false,
      error: null,
    });
    this.router.navigate(['/auth/login']);
  }


  private decodeToken(token: string): { sub?: string; roles?: string[]; tenantSlug?: string; tenantId?: string } {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  }
}
