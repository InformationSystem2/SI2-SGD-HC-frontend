//src/app/layout/components/sidebar/sidebar.ts

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SidebarService } from './services/sidebar.service';
import { SidebarGroup } from './components/sidebar-group/sidebar-group';
import { NAV_ITEMS } from './config/nav.config';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/auth/services/auth.service';
import { BrandingService } from '../../../core/services/branding.service';
import { RolePolicyService } from '../../../core/auth/services/role-policy.service';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarGroup, FontAwesomeModule, TranslateModule],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly sidebarService = inject(SidebarService);
  readonly authService    = inject(AuthService);
  readonly brandingService = inject(BrandingService);
  readonly rolePolicyService = inject(RolePolicyService);
  readonly visibleNavItems = computed(() => {
    return NAV_ITEMS.filter(item => {
      const hasPermission = !item.permissions || item.permissions.some(p => this.authService.hasPermission(p));
      const hasRole = !item.roles || this.rolePolicyService.hasAnyRole(item.roles);
      return hasPermission && hasRole;
    });
  });

  readonly faBars            = faBars;
  readonly faEllipsisVertical = faEllipsisVertical;

  readonly avatarUrl = computed(() => {
    const name = this.authService.username() ?? 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&bold=true`;
  });

  readonly firstRole = computed(() => {
    const roles = this.authService.roles();
    return roles.length > 0 ? roles[0] : null;
  });
}
