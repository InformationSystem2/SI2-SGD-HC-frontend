import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  beforeEach(async () => {
    const mockTranslateService = {
      setDefaultLang: vi.fn(),
      use: vi.fn(),
      instant: vi.fn((key) => key),
      addLangs: vi.fn(),
      getBrowserLang: vi.fn(() => 'es'),
      getDefaultLang: vi.fn(() => 'es')
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
