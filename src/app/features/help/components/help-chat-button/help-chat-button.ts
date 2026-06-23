import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpChatModal } from '../help-chat-modal/help-chat-modal';
import { HelpIcon } from '../help-icon/help-icon';

@Component({
  selector: 'app-help-chat-button',
  standalone: true,
  imports: [CommonModule, HelpChatModal, HelpIcon],
  templateUrl: './help-chat-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpChatButton {
  readonly variant = input<'primary' | 'mini'>('primary');
  readonly position = input<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');

  readonly isModalOpen = signal<boolean>(false);

  getPositionClasses(): string {
    const positions = {
      'bottom-right': 'bottom-20 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    };
    return positions[this.position()];
  }

  getSizeClasses(): string {
    if (this.variant() === 'mini') {
      return 'w-12 h-12 text-sm';
    }
    return 'w-14 h-14 text-base';
  }
}
