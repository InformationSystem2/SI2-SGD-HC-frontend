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
  faHeartPulse,
  faChevronDown,
  faBuilding,
  faXRay,
  faNotesMedical,
  faInbox,
  faBell,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAP: Record<string, IconDefinition> = {
  'layout-dashboard': faGaugeHigh,
  'file-text':        faFileLines,
  'folder-open':      faFolderOpen,
  'users':            faUsers,
  'settings':         faGear,
  'shield':           faShieldHalved,
  'heart-pulse':      faHeartPulse,
  'building':         faBuilding,
  'scan':             faXRay,
  'search':           faNotesMedical,
  'inbox':            faInbox,
  'bell':             faBell,
};

@Component({
  selector: 'app-sidebar-item',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, TranslatePipe],
  templateUrl: './sidebar-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarItem {
  item = input.required<NavItem>();

  readonly sidebarService = inject(SidebarService);

  /** Controla el acordeón (expanded) o el popup flotante (collapsed) */
  readonly open = signal(false);

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly faChevronDown = faChevronDown;

  getIcon(name: string): IconDefinition {
    return ICON_MAP[name] ?? faCircle;
  }

  hasSubItems(): boolean {
    return (this.item().subItems?.length ?? 0) > 0;
  }

  // ── Modo expandido: acordeón por click ──────────────────────────────────

  toggleAccordion(event: Event): void {
    if (!this.hasSubItems()) return;
    event.preventDefault();
    event.stopPropagation();
    this.open.update(v => !v);
  }

  // ── Modo colapsado: popup por hover ─────────────────────────────────────

  onMouseEnter(): void {
    if (this.sidebarService.expanded()) return;
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    if (this.hasSubItems()) this.open.set(true);
  }

  onMouseLeave(): void {
    if (this.sidebarService.expanded()) return;
    this.hoverTimeout = setTimeout(() => this.open.set(false), 200);
  }

  onPopupEnter(): void {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
  }
}
