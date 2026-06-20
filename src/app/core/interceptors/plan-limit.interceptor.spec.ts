import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { planLimitInterceptor } from './plan-limit.interceptor';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('planLimitInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockTranslateService: any;

  beforeEach(() => {
    mockTranslateService = {
      instant: vi.fn((key: string, params?: any) => {
        const translations: Record<string, string> = {
          'PLAN_LIMIT.TITLE': 'Límite de Plan Alcanzado',
          'PLAN_LIMIT.USERS': 'Usuarios',
          'PLAN_LIMIT.PATIENTS': 'Pacientes',
          'PLAN_LIMIT.DOCUMENTS': 'Documentos',
          'PLAN_LIMIT.TEMPLATES': 'Plantillas',
          'PLAN_LIMIT.DICOM': 'Estudios DICOM',
          'PLAN_LIMIT.ROLES': 'Roles de Staff',
          'PLAN_LIMIT.STORAGE': 'Almacenamiento',
          'PLAN_LIMIT.OCR_PAGES': 'Páginas OCR',
          'PLAN_LIMIT.API_CALLS': 'Llamadas API',
        };
        if (key === 'PLAN_LIMIT.MESSAGE' && params) {
          return `${params.resource}: ${params.current}/${params.max}`;
        }
        return translations[key] || key;
      })
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([planLimitInterceptor])),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    const toast = document.getElementById('plan-limit-toast');
    if (toast) toast.remove();
  });

  it('should create a toast when receiving a 403 Plan Limit Exceeded error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.fail('should have failed with 403'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/test');

    req.flush({
      error: 'Plan Limit Exceeded',
      resourceType: 'usuarios',
      currentCount: 10,
      maxLimit: 10
    }, { status: 403, statusText: 'Forbidden' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain('Límite de Plan Alcanzado');
    expect(toast?.textContent).toContain('Usuarios');
  });

  it('should not create a toast for other 403 errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.fail('should have failed with 403'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/test');

    req.flush({
      error: 'Forbidden',
      message: 'Access Denied'
    }, { status: 403, statusText: 'Forbidden' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeFalsy();
  });

  it('should pass through successful requests unmodified', () => {
    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual({ data: 'success' });
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'success' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeFalsy();
  });

  it('should not create toast for 500 errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ error: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeFalsy();
  });

  it('should remove existing toast before creating a new one', () => {
    const existingToast = document.createElement('div');
    existingToast.id = 'plan-limit-toast';
    document.body.appendChild(existingToast);

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({
      error: 'Plan Limit Exceeded',
      resourceType: 'pacientes',
      currentCount: 50,
      maxLimit: 50
    }, { status: 403, statusText: 'Forbidden' });

    const toasts = document.querySelectorAll('#plan-limit-toast');
    expect(toasts.length).toBe(1);
  });

  it('should handle missing resourceType gracefully', () => {
    httpClient.get('/api/test').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({
      error: 'Plan Limit Exceeded',
      resourceType: '',
      currentCount: 0,
      maxLimit: 0
    }, { status: 403, statusText: 'Forbidden' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain('Límite de Plan Alcanzado');
  });

  it('should map storage resourceType to correct label', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({
      error: 'Plan Limit Exceeded',
      resourceType: 'almacenamiento',
      currentCount: 1073741824,
      maxLimit: 1073741824
    }, { status: 403, statusText: 'Forbidden' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeTruthy();
    expect(mockTranslateService.instant).toHaveBeenCalledWith('PLAN_LIMIT.STORAGE');
  });

  it('should pass through 401 errors unchanged', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const toast = document.getElementById('plan-limit-toast');
    expect(toast).toBeFalsy();
  });
});
