import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';
import { BrandingService } from './core/services/branding.service';
import { SubscriptionStatusService } from './core/services/subscription-status.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    inject(ThemeService);
    inject(LanguageService);
    inject(BrandingService);
    inject(SubscriptionStatusService).checkStatus();
  }
}
