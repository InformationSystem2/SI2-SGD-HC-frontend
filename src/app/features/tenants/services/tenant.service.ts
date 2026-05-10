import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TenantPaymentRequestDto, TenantRegisterRequestDto, TenantRegisterResponseDto } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Estado local para manejar cargas y errores (como lo hace el AuthService)
  private _state = signal<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null
  });

  readonly isLoading = () => this._state().loading;
  readonly error = () => this._state().error;

  startRegistration(data: TenantRegisterRequestDto) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    return this.http.post<TenantRegisterResponseDto>(`${environment.apiUrl}/tenants/public/register`, data).pipe(
      tap((res) => {
        this._state.update(s => ({ ...s, loading: false }));
        // Redirigir a pago pasando el tenantId
        this.router.navigate(['/tenants/payment'], { 
          queryParams: { 
            id: res.tenantId,
            username: res.adminUsername 
          } 
        });
      }),
      catchError(err => {
        const message = err.error?.message || err.error?.error || 'ERRORS.REGISTRATION_FAILED';
        this._state.update(s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }

  processPayment(tenantId: string) {
    this._state.update(s => ({ ...s, loading: true, error: null }));
    const request: TenantPaymentRequestDto = { tenantId };
    
    // CORRECCIÓN CRÍTICA: Apuntando al endpoint correcto de pago (/pay)
    return this.http.post<any>(`${environment.apiUrl}/tenants/public/pay`, request).pipe(
      tap(() => {
        this._state.update(s => ({ ...s, loading: false }));
        this.router.navigate(['/auth/login']);
      }),
      catchError(err => {
        const message = err.error?.message || 'ERRORS.PAYMENT_FAILED';
        this._state.update(s => ({ ...s, loading: false, error: message }));
        return EMPTY;
      })
    );
  }
}
