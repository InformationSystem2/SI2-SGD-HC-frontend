import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
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
    const attributePermissionsStr = localStorage.getItem('attributePermissions');
    let attributePermissions = {};
    try {
      if (attributePermissionsStr) attributePermissions = JSON.parse(attributePermissionsStr);
    } catch {}
    let username: string | null = null;
    let roles: string[] | null  = null;
    let tenantId: string | null = null;
    let permissions: string[] | null = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        username = payload.sub   ?? null;
        roles    = payload.roles ?? null;
        tenantId = payload.tenantId ?? null;
        const cachedPerms = localStorage.getItem('permissions');
        if (cachedPerms) {
          permissions = JSON.parse(cachedPerms);
        }
      } catch { /* token malformado */ }
    }
    return { accessToken, username, roles, attributePermissions, expiresAt, loading: false, error: null } as any;
  })());

  readonly accessToken     = computed(() => this._state().accessToken);
  readonly isAuthenticated = computed(() => !!this._state().accessToken);
  readonly isLoading       = computed(() => this._state().loading);
  readonly error           = computed(() => this._state().error);
  readonly username        = computed(() => this._state().username);
  readonly roles           = computed(() => this._state().roles ?? []);
  readonly tenantId        = computed(() => this._state().tenantId);
  readonly permissions     = computed(() => this._state().permissions ?? []);

  readonly isTokenExpired = computed(() => {
    const exp = this._state().expiresAt;
    if (!exp) return true;
    return Date.now() > exp;
  });

  constructor() {
    // Si ya está autenticado al cargar el servicio, refrescar los permisos de forma asíncrona
    if (this.isAuthenticated() && !this.isTokenExpired()) {
      this.fetchPermissions().subscribe();
    }
  }

  fetchPermissions() {
    return this.http.get<string[]>(`${environment.apiUrl}/auth/me/permissions`).pipe(
      tap( permissions => {
        localStorage.setItem('permissions', JSON.stringify(permissions));
        this._state.update( s => ({
          ...s,
          permissions
        }));
      }),
      catchError( err => {
        console.error('Error refreshing permissions:', err);
        return EMPTY;
      })
    );
  }

  hasPermission(permission: string): boolean {
    return this.roles().includes(permission) || this.permissions().includes(permission);
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some(p => this.roles().includes(p) || this.permissions().includes(p));
  }

  login(credentials: LoginRequest) {
    this._state.update( s => ({ ...s, loading: true, error: null}));

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      switchMap( response => {
        const payload = this.decodeToken(response.accessToken);

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('tenantSlug', payload.tenantSlug || '');
        localStorage.setItem('expiresAt', String(Date.now() + response.expiresIn));

        this._state.set({
          accessToken: response.accessToken,
          username: payload.sub ?? null,
          roles: payload.roles ?? [],
          attributePermissions: {}, // Inicialmente vacío
          expiresAt: Date.now() + response.expiresIn,
          tenantId: payload.tenantId ?? null,
          loading: true,
          error: null,
          permissions: null
        });

        this.branding.load();        

        // Cargar los permisos antes de redirigir
        return this.http.get<string[]>(`${environment.apiUrl}/auth/me/permissions`).pipe(
          tap( permissions => {
            localStorage.setItem('permissions', JSON.stringify(permissions));
            this._state.update( s => ({
              ...s,
              permissions,
              loading: false
            }));
            this.router.navigate(['/dashboard']);
          }),
          catchError( err => {
            console.error('Error fetching permissions:', err);
            this._state.update( s => ({
              ...s,
              loading: false
            }));
            this.router.navigate(['/dashboard']);
            return EMPTY;
          })
        );
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
    localStorage.removeItem('permissions');
    this._state.set({
      accessToken: null,
      username: null,
      roles: null,
      expiresAt: null,
      tenantId: null,
      loading: false,
      error: null,
      permissions: null
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

  forgotPassword(request: import('../models/auth.models').ForgotPasswordRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    return this.http.post<{message: string, code?: string}>(`${environment.apiUrl}/auth/public/forgot-password`, request).pipe(
      tap(() => this._state.update(s => ({ ...s, loading: false }))),
      catchError(err => {
        const message = err.error?.message ?? 'ERRORS.FORGOT_PASSWORD_FAILED';
        this._state.update(s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }

  resetPassword(request: import('../models/auth.models').VerifyRecoveryCodeRequest) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    return this.http.post<{message: string}>(`${environment.apiUrl}/auth/public/reset-password`, request).pipe(
      tap(() => this._state.update(s => ({ ...s, loading: false }))),
      catchError(err => {
        const message = err.error?.message ?? 'ERRORS.RESET_PASSWORD_FAILED';
        this._state.update(s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }
}
