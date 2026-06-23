import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faRightFromBracket, faMoon, faSun, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { SidebarService } from '../sidebar/services/sidebar.service';
import { BrandingService } from '../../../core/services/branding.service';
import { SubscriptionStatusService } from '../../../core/services/subscription-status.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationBell } from '../notification-bell/notification-bell';

@Component({
  selector: 'app-navbar',
  imports: [FontAwesomeModule, TranslatePipe, NotificationBell, RouterLink],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly authService    = inject(AuthService);
  readonly themeService   = inject(ThemeService);
  readonly langService    = inject(LanguageService);
  readonly sidebarService = inject(SidebarService);
  readonly brandingService = inject(BrandingService);
  readonly subStatus      = inject(SubscriptionStatusService);
  readonly router         = inject(Router);

  readonly faLogout   = faRightFromBracket;
  readonly faMoon     = faMoon;
  readonly faSun      = faSun;
  readonly faLanguage = faLanguage;
  readonly faBars     = faBars;
}
