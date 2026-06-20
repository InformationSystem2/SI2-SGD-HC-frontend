import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlanService, PlanUpdateDto } from './plan.service';
import { environment } from '../../../environments/environment';
import { PlanDto } from '../../features/tenants/models/plan.model';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('PlanService', () => {
  let service: PlanService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/plans`;

  const mockPlanDto: PlanDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'BASIC',
    displayName: 'Básico',
    description: 'Plan gratuito',
    priceMonthly: 0,
    priceYearly: 0,
    cycleDays: 30,
    gracePeriodDays: 3,
    sortOrder: 1,
    limits: { maxUsers: 10 },
    features: { dicom_imaging: false }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanService]
    });
    service = TestBed.inject(PlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get plans and cache them', () => {
    service.getPlans().subscribe(plans => {
      expect(plans.length).toBe(1);
      expect(plans[0].name).toBe('BASIC');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockPlanDto]);

    // Second call should be cached (no HTTP request)
    service.getPlans().subscribe();
    httpMock.expectNone(apiUrl);
  });

  it('should get plan by name', () => {
    service.getPlan('BASIC').subscribe(plan => {
      expect(plan.name).toBe('BASIC');
    });

    const req = httpMock.expectOne(`${apiUrl}/BASIC`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlanDto);
  });

  it('should get plan limits', () => {
    service.getPlanLimits('BASIC').subscribe(limits => {
      expect(limits['maxUsers']).toBe(10);
    });

    const req = httpMock.expectOne(`${apiUrl}/BASIC/limits`);
    expect(req.request.method).toBe('GET');
    req.flush({ maxUsers: 10 });
  });

  it('should get plan features', () => {
    service.getPlanFeatures('BASIC').subscribe(features => {
      expect(features['dicom_imaging']).toBe(false);
    });

    const req = httpMock.expectOne(`${apiUrl}/BASIC/features`);
    expect(req.request.method).toBe('GET');
    req.flush({ dicom_imaging: false });
  });

  it('should update plan and clear cache', () => {
    const updateDto: PlanUpdateDto = { displayName: 'Básico Pro' };
    const updatedPlan = { ...mockPlanDto, displayName: 'Básico Pro' };

    // Prime the cache
    service.getPlans().subscribe();
    httpMock.expectOne(apiUrl).flush([mockPlanDto]);

    // Update plan
    service.updatePlan(mockPlanDto.id, updateDto).subscribe(plan => {
      expect(plan.displayName).toBe('Básico Pro');
    });

    const req = httpMock.expectOne(`${apiUrl}/admin/${mockPlanDto.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(updatedPlan);

    // Cache should be cleared, so this triggers a new request
    service.getPlans().subscribe();
    httpMock.expectOne(apiUrl).flush([updatedPlan]);
  });
});
