import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly expanded   = signal(true);
  readonly mobileOpen = signal(false);

  toggle(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.mobileOpen.update(v => !v);
    } else {
      this.expanded.update(v => !v);
    }
  }

  openMobile(): void  { this.mobileOpen.set(true);  }
  closeMobile(): void { this.mobileOpen.set(false); }
}
