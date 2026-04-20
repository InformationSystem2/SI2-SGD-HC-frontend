import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SidebarService } from './services/sidebar.service';
import { SidebarGroup } from './components/sidebar-group/sidebar-group';
import { NAV_ITEMS } from './config/nav.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-sidebar',
  imports: [
    // provideLucideIcons,
    SidebarGroup,
    FontAwesomeModule,
  ],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly sidebarService = inject(SidebarService);
  readonly navItems = NAV_ITEMS;

  readonly faBars = faBars;
  readonly faEllipsisVertical = faEllipsisVertical;
}
