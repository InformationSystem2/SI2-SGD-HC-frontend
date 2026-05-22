import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBan, faCheck, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

export type ConfirmType = 'SUSPEND' | 'REACTIVATE' | 'HARD_DELETE';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmText = input<string>('COMMON.CONFIRM');
  readonly cancelText = input<string>('COMMON.CANCEL');
  readonly type = input<ConfirmType>('SUSPEND');
  readonly dangerPlaceholder = input<string>('');
  readonly dangerMatchValue = input<string>('');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly faBan = faBan;
  readonly faCheck = faCheck;
  readonly faTriangleExclamation = faTriangleExclamation;
  readonly faXmark = faXmark;

  readonly userInput = signal('');

  onConfirm(): void {
    if (this.type() === 'HARD_DELETE' && this.userInput() !== this.dangerMatchValue()) return;
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onInputChange(value: string): void {
    this.userInput.set(value);
  }

  get isDangerConfirmed(): boolean {
    return this.type() !== 'HARD_DELETE' || this.userInput() === this.dangerMatchValue();
  }

  getIcon() {
    switch (this.type()) {
      case 'REACTIVATE': return this.faCheck;
      case 'HARD_DELETE': return this.faBan;
      default: return this.faTriangleExclamation;
    }
  }

  getConfirmButtonClass(): string {
    if (this.type() === 'REACTIVATE') return 'hc-btn-primary';
    return 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-hc-error hover:bg-red-700 transition-colors rounded-lg';
  }
}