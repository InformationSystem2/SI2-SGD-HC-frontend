import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthState, LoginRequest, LoginResponse } from '../models/auth.models';



@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private _state = signal<AuthState>((() => {
    const accessToken = localStorage.getItem('accessToken');
    const expiresAt   = Number(localStorage.getItem('expiresAt')) || null;
    let username: string | null = null;
    let roles: string[] | null  = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        username = payload.sub   ?? null;
        roles    = payload.roles ?? null;
      } catch { /* token malformado */ }
    }
    return { accessToken, username, roles, expiresAt, loading: false, error: null };
  })());

  readonly accessToken     = computed(() => this._state().accessToken);
  readonly isAuthenticated = computed(() => !!this._state().accessToken);
  readonly isLoading       = computed(() => this._state().loading);
  readonly error           = computed(() => this._state().error);
  readonly username        = computed(() => this._state().username);
  readonly roles           = computed(() => this._state().roles ?? []);

  readonly isTokenExpired = computed(() => {
    const exp = this._state().expiresAt;
    if (!exp) return true;
    return Date.now() > exp;
  });

  login(credentials: LoginRequest) {
    this._state.update( s => ({ ...s, loading: true, error: null}));

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap( response => {

        const payload = this.decodeToken(response.accessToken);

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('expiresAt', String(Date.now() + response.expiresIn));

        this._state.set({
          accessToken: response.accessToken,
          username: payload.sub ?? null,
          roles: payload.roles ?? [],
          expiresAt: Date.now() + response.expiresIn,
          loading: false,
          error: null,
        });

        this.router.navigate(['/dashboard']);
      }),
      catchError( err => {
        const message = err.error?.message ?? 'credenciales incorrectas';
        this._state.update( s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }


  register(data: {
    email: string; firstName: string; lastName: string; password: string;
    documentType?: string; documentNumber?: string; phone?: string; gender?: string;
  }) {
    this._state.update(s => ({ ...s, loading: true, error: null }));

    return this.http.post<void>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(() => {
        this._state.update(s => ({ ...s, loading: false }));
        this.router.navigate(['/auth/login']);
      }),
      catchError(err => {
        const message = err.error?.message ?? 'Error al registrarse';
        this._state.update(s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresAt');
    this._state.set({
      accessToken: null,
      username: null,
      roles: null,
      expiresAt: null,
      loading: false,
      error: null,
    });
    this.router.navigate(['/auth/login']);
  }


  private decodeToken(token: string): { sub?: string; roles?: string[] } {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}
}
