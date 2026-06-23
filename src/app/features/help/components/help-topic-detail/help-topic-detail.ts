import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getTopicById } from '../../data/help-topics';
import { HelpCategory } from '../../models/help.models';
import { HelpIcon } from '../help-icon/help-icon';

@Component({
  selector: 'app-help-topic-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe, HelpIcon],
  templateUrl: './help-topic-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpTopicDetail {
  private readonly translate = inject(TranslateService);

  readonly topicId = input.required<string>();
  readonly back = output<void>();
  readonly close = output<void>();

  readonly topic = computed(() => getTopicById(this.topicId()));

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      [HelpCategory.GENERAL]: 'from-slate-600 to-slate-500',
      [HelpCategory.DOCUMENTS]: 'from-teal-600 to-teal-500',
      [HelpCategory.PATIENTS]: 'from-blue-600 to-blue-500',
      [HelpCategory.CLINICAL_HISTORY]: 'from-cyan-600 to-cyan-500',
      [HelpCategory.USERS]: 'from-indigo-600 to-indigo-500',
      [HelpCategory.DICOM]: 'from-rose-600 to-rose-500',
      [HelpCategory.REPORTS]: 'from-amber-600 to-amber-500',
      [HelpCategory.AUDIT]: 'from-orange-600 to-orange-500',
      [HelpCategory.SETTINGS]: 'from-emerald-600 to-emerald-500',
      [HelpCategory.BACKUPS]: 'from-purple-600 to-purple-500'
    };
    return colors[category] || 'from-teal-600 to-teal-500';
  }

  contactSupport(): void {
    alert(this.translate.instant('HELP.UI.CONTACT_SUPPORT_MSG'));
  }
}
