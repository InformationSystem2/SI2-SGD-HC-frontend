import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { PlanDto } from '../../features/tenants/models/plan.model';
import { environment } from '../../../environments/environment';

export interface PlanUpdateDto {
  displayName?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  cycleDays?: number;
  gracePeriodDays?: number;
  limits?: Record<string, number>;
  features?: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/plans`;

  private plansCache$: Observable<PlanDto[]> | null = null;

  getPlans(): Observable<PlanDto[]> {
    if (!this.plansCache$) {
      this.plansCache$ = this.http.get<PlanDto[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.plansCache$;
  }

  getPlan(name: string): Observable<PlanDto> {
    return this.http.get<PlanDto>(`${this.apiUrl}/${name}`);
  }

  getPlanLimits(name: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/${name}/limits`);
  }

  getPlanFeatures(name: string): Observable<Record<string, boolean>> {
    return this.http.get<Record<string, boolean>>(`${this.apiUrl}/${name}/features`);
  }

  updatePlan(id: string, dto: PlanUpdateDto): Observable<PlanDto> {
    return this.http.put<PlanDto>(`${this.apiUrl}/admin/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  clearCache(): void {
    this.plansCache$ = null;
  }
}
