//src/app/core/services/language.service.ts

import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'hc-lang';

  readonly currentLang = signal<Lang>(this.getInitialLang());

  constructor(private translate: TranslateService) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
    translate.use(this.currentLang());
  }

  toggle(): void {
    this.setLang(this.currentLang() === 'es' ? 'en' : 'es');
  }

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  private getInitialLang(): Lang {
    return (localStorage.getItem(this.STORAGE_KEY) as Lang | null) ?? 'es';
  }
}
