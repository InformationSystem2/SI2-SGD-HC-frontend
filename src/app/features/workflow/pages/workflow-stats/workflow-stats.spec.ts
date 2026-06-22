import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowStatsPage } from './workflow-stats';
import { ReviewTaskService } from '../../services/review-task.service';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WorkflowStatsPage', () => {
  let component: WorkflowStatsPage;
  let fixture: ComponentFixture<WorkflowStatsPage>;
  let mockReviewTaskService: any;

  beforeEach(async () => {
    mockReviewTaskService = {
      getStats: vi.fn(),
    };

    const mockTranslateService = {
      instant: vi.fn((key: string) => key),
      get: vi.fn((key: string) => of(key)),
    };

    await TestBed.configureTestingModule({
      imports: [WorkflowStatsPage],
      providers: [
        { provide: ReviewTaskService, useValue: mockReviewTaskService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStatsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats on init', () => {
    const stats = {
      pendingCount: 5,
      inProgressCount: 3,
      completedCount: 10,
      cancelledCount: 2,
      overdueCount: 1,
      completedLast30Days: 7,
      avgHoursToComplete: 4.5,
    };
    mockReviewTaskService.getStats.mockReturnValue(of(stats));

    component.ngOnInit();

    expect(component.stats()).toEqual(stats);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should set error on failure', () => {
    mockReviewTaskService.getStats.mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );

    component.ngOnInit();

    expect(component.error()).toBe('Server error');
    expect(component.loading()).toBe(false);
    expect(component.stats()).toBeNull();
  });

  it('should set default error message when error has no message', () => {
    mockReviewTaskService.getStats.mockReturnValue(
      throwError(() => ({ error: {} }))
    );

    component.ngOnInit();

    expect(component.error()).toBe('Error');
    expect(component.loading()).toBe(false);
  });
});
