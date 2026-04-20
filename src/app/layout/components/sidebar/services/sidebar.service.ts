import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly expanded = signal(true);

  toggle(): void {
    this.expanded.update(v => !v);
  }
}
