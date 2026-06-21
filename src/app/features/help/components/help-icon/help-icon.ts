import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="w-full h-full"
    >
      <!-- file -->
      <svg:path *ngIf="name() === 'file'" d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <svg:path *ngIf="name() === 'file'" d="M14 2v4a2 2 0 0 0 2 2h4" />

      <!-- upload -->
      <svg:path *ngIf="name() === 'upload'" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <svg:polyline *ngIf="name() === 'upload'" points="17 8 12 3 7 8" />
      <svg:line *ngIf="name() === 'upload'" x1="12" x2="12" y1="3" y2="15" />

      <!-- edit -->
      <svg:path *ngIf="name() === 'edit'" d="M12 20h9" />
      <svg:path *ngIf="name() === 'edit'" d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />

      <!-- save -->
      <svg:path *ngIf="name() === 'save'" d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <svg:path *ngIf="name() === 'save'" d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <svg:path *ngIf="name() === 'save'" d="M7 3v4a1 1 0 0 0 1 1h7" />

      <!-- search -->
      <svg:circle *ngIf="name() === 'search'" cx="11" cy="11" r="8" />
      <svg:line *ngIf="name() === 'search'" x1="21" x2="16.65" y1="21" y2="16.65" />

      <!-- sliders -->
      <svg:line *ngIf="name() === 'sliders'" x1="4" x2="4" y1="21" y2="14" />
      <svg:line *ngIf="name() === 'sliders'" x1="4" x2="4" y1="10" y2="3" />
      <svg:line *ngIf="name() === 'sliders'" x1="12" x2="12" y1="21" y2="12" />
      <svg:line *ngIf="name() === 'sliders'" x1="12" x2="12" y1="8" y2="3" />
      <svg:line *ngIf="name() === 'sliders'" x1="20" x2="20" y1="21" y2="16" />
      <svg:line *ngIf="name() === 'sliders'" x1="20" x2="20" y1="12" y2="3" />
      <svg:line *ngIf="name() === 'sliders'" x1="2" x2="6" y1="14" y2="14" />
      <svg:line *ngIf="name() === 'sliders'" x1="10" x2="14" y1="8" y2="8" />
      <svg:line *ngIf="name() === 'sliders'" x1="18" x2="22" y1="16" y2="16" />

      <!-- eye -->
      <svg:path *ngIf="name() === 'eye'" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <svg:circle *ngIf="name() === 'eye'" cx="12" cy="12" r="3" />

      <!-- users -->
      <svg:path *ngIf="name() === 'users'" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <svg:circle *ngIf="name() === 'users'" cx="9" cy="7" r="4" />
      <svg:path *ngIf="name() === 'users'" d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <svg:path *ngIf="name() === 'users'" d="M16 3.13a4 4 0 0 1 0 7.75" />

      <!-- plus -->
      <svg:line *ngIf="name() === 'plus'" x1="12" x2="12" y1="5" y2="19" />
      <svg:line *ngIf="name() === 'plus'" x1="5" x2="19" y1="12" y2="12" />

      <!-- activity -->
      <svg:polyline *ngIf="name() === 'activity'" points="22 12 18 12 15 21 9 3 6 12 2 12" />

      <!-- spinner -->
      <svg:path *ngIf="name() === 'spinner'" d="M21 12a9 9 0 1 1-6.219-8.56" />

      <!-- shield -->
      <svg:path *ngIf="name() === 'shield'" d="M20 4s-1 .7-3.16 1.25c-3.14.8-6.1.1-6.1.1v6.2c0 4.7 2 7.7 7.1 9.4 5.1-1.7 7.1-4.7 7.1-9.4V5.25C21 4.7 20 4 20 4z" />

      <!-- info -->
      <svg:circle *ngIf="name() === 'info'" cx="12" cy="12" r="10" />
      <svg:line *ngIf="name() === 'info'" x1="12" x2="12" y1="16" y2="12" />
      <svg:line *ngIf="name() === 'info'" x1="12" x2="12.01" y1="8" y2="8" />

      <!-- database -->
      <svg:ellipse *ngIf="name() === 'database'" cx="12" cy="5" rx="9" ry="3" />
      <svg:path *ngIf="name() === 'database'" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <svg:path *ngIf="name() === 'database'" d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />

      <!-- download -->
      <svg:path *ngIf="name() === 'download'" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <svg:polyline *ngIf="name() === 'download'" points="7 10 12 15 17 10" />
      <svg:line *ngIf="name() === 'download'" x1="12" x2="12" y1="15" y2="3" />

      <!-- user-plus -->
      <svg:path *ngIf="name() === 'user-plus'" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <svg:circle *ngIf="name() === 'user-plus'" cx="9" cy="7" r="4" />
      <svg:line *ngIf="name() === 'user-plus'" x1="19" x2="19" y1="8" y2="14" />
      <svg:line *ngIf="name() === 'user-plus'" x1="22" x2="16" y1="11" y2="11" />

      <!-- key -->
      <svg:path *ngIf="name() === 'key'" d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5 3-3" />

      <!-- user -->
      <svg:path *ngIf="name() === 'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <svg:circle *ngIf="name() === 'user'" cx="12" cy="7" r="4" />

      <!-- settings -->
      <svg:circle *ngIf="name() === 'settings'" cx="12" cy="12" r="3" />
      <svg:path *ngIf="name() === 'settings'" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />

      <!-- x -->
      <svg:line *ngIf="name() === 'x'" x1="18" x2="6" y1="6" y2="18" />
      <svg:line *ngIf="name() === 'x'" x1="6" x2="18" y1="6" y2="18" />

      <!-- chevron-right -->
      <svg:polyline *ngIf="name() === 'chevron-right'" points="9 18 15 12 9 6" />

      <!-- arrow-left -->
      <svg:line *ngIf="name() === 'arrow-left'" x1="19" x2="5" y1="12" y2="12" />
      <svg:polyline *ngIf="name() === 'arrow-left'" points="12 19 5 12 12 5" />

      <!-- message -->
      <svg:path *ngIf="name() === 'message'" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />

      <!-- book -->
      <svg:path *ngIf="name() === 'book'" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <svg:path *ngIf="name() === 'book'" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />

      <!-- dollar -->
      <svg:line *ngIf="name() === 'dollar'" x1="12" x2="12" y1="1" y2="23" />
      <svg:path *ngIf="name() === 'dollar'" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />

      <!-- question -->
      <svg:path *ngIf="name() === 'question'" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <svg:line *ngIf="name() === 'question'" x1="12" x2="12.01" y1="17" y2="17" />
      <svg:circle *ngIf="name() === 'question'" cx="12" cy="12" r="10" />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-block;
      width: 1.5rem; /* fallback: w-6 */
      height: 1.5rem; /* fallback: h-6 */
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpIcon {
  readonly name = input.required<string>();
}
