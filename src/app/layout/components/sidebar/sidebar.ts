//src/app/layout/components/sidebar/sidebar.ts

import { ChangeDetectionStrategy, Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { SidebarService } from './services/sidebar.service';
import { SidebarGroup } from './components/sidebar-group/sidebar-group';
import { NAV_ITEMS } from './config/nav.config';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/auth/services/auth.service';
import { BrandingService } from '../../../core/services/branding.service';
import { RolePolicyService } from '../../../core/auth/services/role-policy.service';
import { ReviewTaskService } from '../../../features/workflow/services/review-task.service';
import { interval, Subscription } from 'rxjs';
import type { NavItem } from './models/nav-item.model';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarGroup, FontAwesomeModule, TranslateModule],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar implements OnInit, OnDestroy {
  readonly sidebarService = inject(SidebarService);
  readonly authService    = inject(AuthService);
  readonly brandingService = inject(BrandingService);
  readonly rolePolicyService = inject(RolePolicyService);
  private readonly reviewTaskService = inject(ReviewTaskService);
  private pollingSub: Subscription | null = null;

  readonly pendingCount = signal(0);

  readonly visibleNavItems = computed(() => {
    const count = this.pendingCount();
    return NAV_ITEMS.map(item => {
      const hasPermission = !item.permissions || item.permissions.some(p => this.authService.hasPermission(p));
      const hasRole = !item.roles || this.rolePolicyService.hasAnyRole(item.roles);
      if (!hasPermission || !hasRole) return null;
      if (item.path === '/tasks') {
        return { ...item, badge: count > 0 ? count : undefined };
      }
      return item;
    }).filter((item): item is NavItem => item !== null);
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

  ngOnInit(): void {
    this.refreshPendingCount();
    this.pollingSub = interval(60_000).subscribe(() => {
      this.refreshPendingCount();
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  private refreshPendingCount(): void {
    this.reviewTaskService.getMyTasks().subscribe(tasks => {
      this.pendingCount.set(tasks.filter(t => t.status === 'PENDING').length);
    });
  }
}
