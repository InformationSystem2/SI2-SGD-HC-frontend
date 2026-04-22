import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { NavItem } from '../../models/nav-item.model';
import { SidebarService } from '../../services/sidebar.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import {
  faShieldHalved,
  faGaugeHigh,
  faFileLines,
  faFolderOpen,
  faUsers,
  faGear,
  faCircle,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAP: Record<string, IconDefinition> = {
  'layout-dashboard': faGaugeHigh,
  'file-text':        faFileLines,
  'folder-open':      faFolderOpen,
  'users':            faUsers,
  'settings':         faGear,
  'shield':           faShieldHalved,
};

@Component({
  selector: 'app-sidebar-item',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, TranslatePipe],
  templateUrl: './sidebar-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarItem {
  item = input.required<NavItem>();

  getIcon(name: string): IconDefinition {
    return ICON_MAP[name] ?? faCircle;
  }

  readonly sidebarService = inject(SidebarService);
  readonly showSubmenu = signal(false);

  private timeout: ReturnType<typeof setTimeout> | null = null;

  onMouseEnter(): void {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.item().subItems?.length) this.showSubmenu.set(true);
  }

  onMouseLeave(): void {
    this.timeout = setTimeout(() => this.showSubmenu.set(false), 200);
  }

  onSubmenuEnter(): void {
    if (this.timeout) clearTimeout(this.timeout);
  }
}
