import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  TenantInfo, TenantPaymentRequestDto, TenantRegisterRequestDto,
  TenantSettings, TenantStats, TenantListItem, TenantDetail,
  TenantStatusUpdate,
} from '../models/tenant.model';

export interface TenantSessionResponse {
  sessionToken: string;
  message: string;
}

export interface RegistrationData {
  tenantName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
  adminDocumentType: string;
  adminDocumentNumber: string;
  adminGender: string;
}

export interface TenantFlowData {
  sessionToken: string;
  selectedPlan: string;
  billingCycle: string;
  registrationData: RegistrationData;
  expiresAt: number;
}

const STORAGE_KEY = 'tenant_registration_flow';
const TTL_MINUTES = 15;

@Injectable({ providedIn: 'root' })
export class TenantService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tenants = signal<TenantListItem[]>([]);
  readonly totalItems = signal(0);
  readonly currentTenant = signal<TenantDetail | null>(null);

  private getTenantSlug(): string {
    return localStorage.getItem('tenantSlug') || '';
  }

  private authenticatedHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-Tenant-ID': this.getTenantSlug() });
  }

  private saveToLocalStorage(data: TenantFlowData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  loadFromLocalStorage(): TenantFlowData | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const data: TenantFlowData = JSON.parse(stored);
      if (Date.now() > data.expiresAt) {
        this.clearLocalStorage();
        return null;
      }
      return data;
    } catch {
      this.clearLocalStorage();
      return null;
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  updatePlanInFlow(newPlan: string): any {
    const flowData = this.loadFromLocalStorage();
    if (flowData) {
      flowData.selectedPlan = newPlan;
      this.saveToLocalStorage(flowData);
      return { sessionToken: flowData.sessionToken };
    }
    return EMPTY;
  }

  updateRegistrationData(data: {
    tenantName: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPhone: string;
    adminDocumentType: string;
    adminDocumentNumber: string;
    adminGender: string;
  }): void {
    const flowData = this.loadFromLocalStorage();
    if (flowData) {
      flowData.registrationData = {
        tenantName: data.tenantName,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        adminDocumentType: data.adminDocumentType,
        adminDocumentNumber: data.adminDocumentNumber,
        adminGender: data.adminGender,
        adminPassword: ''
      };
      this.saveToLocalStorage(flowData);
    }
  }

  getFlowData(): TenantFlowData | null {
    return this.loadFromLocalStorage();
  }

  initSession(selectedPlan: string, billingCycle: string = 'MONTHLY') {
    this.loading.set(true);
    return this.http.post<TenantSessionResponse>(`${environment.apiUrl}/tenants/public/init-session`, { selectedPlan, billingCycle }).pipe(
      tap((res) => {
        this.loading.set(false);
        const flowData: TenantFlowData = {
          sessionToken: res.sessionToken,
          selectedPlan,
          billingCycle,
          registrationData: {} as RegistrationData,
          expiresAt: Date.now() + (TTL_MINUTES * 60 * 1000)
        };
        this.saveToLocalStorage(flowData);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'ERRORS.INIT_SESSION_FAILED');
        return EMPTY;
      })
    );
  }

  sendVerificationCode(email: string) {
    this.loading.set(true);
    return this.http.post<{message: string, code?: string}>(`${environment.apiUrl}/tenants/public/send-verification-code`, { email }).pipe(
      tap((res) => {
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'ERRORS.SEND_CODE_FAILED');
        return EMPTY;
      })
    );
  }

  startRegistration(data: TenantRegisterRequestDto) {
    this.loading.set(true);
    const flowData = this.loadFromLocalStorage();
    if (!flowData) {
      this.loading.set(false);
      this.error.set(this.translate.instant('ERRORS.SESSION_EXPIRED'));
      return EMPTY;
    }
    const requestWithToken = { ...data, sessionToken: flowData.sessionToken };
    return this.http.post<any>(`${environment.apiUrl}/tenants/public/register`, requestWithToken).pipe(
      tap((res) => {
        this.loading.set(false);
        const updatedFlowData: TenantFlowData = {
          ...flowData,
          registrationData: {
            tenantName: data.tenantName,
            adminFirstName: data.adminFirstName,
            adminLastName: data.adminLastName,
            adminEmail: data.adminEmail,
            adminPassword: data.adminPassword,
            adminPhone: data.adminPhone || '',
            adminDocumentType: data.adminDocumentType,
            adminDocumentNumber: data.adminDocumentNumber,
            adminGender: data.adminGender
          }
        };
        this.saveToLocalStorage(updatedFlowData);
        this.router.navigate(['/tenants/payment']);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'ERRORS.REGISTRATION_FAILED');
        return EMPTY;
      })
    );
  }

  processPayment(paymentIntentId?: string) {
    this.loading.set(true);
    const flowData = this.loadFromLocalStorage();
    if (!flowData) {
      this.loading.set(false);
      this.error.set(this.translate.instant('ERRORS.SESSION_EXPIRED'));
      return EMPTY;
    }
    const request: TenantPaymentRequestDto = { 
      sessionToken: flowData.sessionToken,
      paymentIntentId 
    };
    return this.http.post<any>(`${environment.apiUrl}/tenants/public/pay`, request).pipe(
      tap((res) => {
        this.loading.set(false);
        if (res.adminUsername) {
          localStorage.setItem('registeredAdminUsername', res.adminUsername);
        }
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'ERRORS.PAYMENT_FAILED');
        return EMPTY;
      })
    );
  }

  createOnboardingPaymentIntent(sessionToken: string) {
    return this.http.post<any>(`${environment.apiUrl}/tenants/public/create-payment-intent`, { sessionToken });
  }

  createChangePlanPaymentIntent(plan: string) {
    return this.http.post<any>(`${environment.apiUrl}/tenants/current/create-payment-intent`, { plan }, { headers: this.authenticatedHeaders() });
  }

  getSettings() {
    return this.http.get<TenantSettings>(`${environment.apiUrl}/tenants/current/settings`, { headers: this.authenticatedHeaders() });
  }

  updateSettings(settings: Partial<TenantSettings>) {
    return this.http.put<TenantSettings>(`${environment.apiUrl}/tenants/current/settings`, settings, { headers: this.authenticatedHeaders() });
  }

  getTenantInfo() {
    return this.http.get<TenantInfo>(`${environment.apiUrl}/tenants/current/info`, { headers: this.authenticatedHeaders() });
  }

  updateTenantInfo(data: { name?: string; email?: string; phone?: string; address?: string; logoUrl?: string }) {
    return this.http.put<TenantInfo>(`${environment.apiUrl}/tenants/current/info`, data, { headers: this.authenticatedHeaders() });
  }

  getTenantStats() {
    return this.http.get<TenantStats>(`${environment.apiUrl}/tenants/current/stats`, { headers: this.authenticatedHeaders() });
  }

  renewSubscription(plan: string, paymentIntentId?: string) {
    const request = { plan, paymentIntentId };
    return this.http.post<any>(`${environment.apiUrl}/tenants/current/renew`, request, { headers: this.authenticatedHeaders() });
  }

  changePlan(newPlan: string, paymentIntentId?: string) {
    const request = { newPlan, paymentIntentId };
    return this.http.post<any>(`${environment.apiUrl}/tenants/current/change-plan`, request, { headers: this.authenticatedHeaders() });
  }

  // ── ADMIN TENANT MANAGEMENT (HU-17) ─────────────────────────────────────

  getTenants(page = 0, size = 20, search?: string) {
    this.loading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
    };
    if (search) params['search'] = search;
    return this.http.get<{ content: TenantListItem[]; totalElements: number }>(`${environment.apiUrl}/tenants/admin/list`, { params }).pipe(
      tap(data => {
        this.tenants.set(data.content);
        this.totalItems.set(data.totalElements);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? this.translate.instant('ERRORS.ERROR_LOAD_TENANTS_MSG'));
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  getTenantById(id: string) {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<TenantDetail>(`${environment.apiUrl}/tenants/admin/${id}`).pipe(
      tap(data => {
        this.currentTenant.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? this.translate.instant('ERRORS.ERROR_LOAD_TENANT_MSG'));
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  updateStatus(id: string, action: 'SUSPEND' | 'REACTIVATE') {
    this.loading.set(true);
    this.error.set(null);
    return this.http.put<TenantDetail>(`${environment.apiUrl}/tenants/admin/${id}/status`, action).pipe(
      tap(data => {
        this.currentTenant.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? this.translate.instant('ERRORS.ERROR_UPDATE_STATUS_MSG'));
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  deleteTenant(id: string, confirmText?: string) {
    this.loading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (confirmText) params['confirmText'] = confirmText;
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/tenants/admin/${id}`, { params }).pipe(
      tap(() => {
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? this.translate.instant('ERRORS.ERROR_DELETE_MSG'));
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  refreshTenant(id: string) {
    this.getTenantById(id).subscribe();
  }

  refreshList() {
    this.getTenants().subscribe();
  }
}