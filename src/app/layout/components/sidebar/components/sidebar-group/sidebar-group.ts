import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SidebarItem } from '../sidebar-item/sidebar-item';
import type { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-sidebar-group',
  imports: [SidebarItem],
  templateUrl: './sidebar-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarGroup {
  items = input.required<NavItem[]>();
  label = input<string>();
}
