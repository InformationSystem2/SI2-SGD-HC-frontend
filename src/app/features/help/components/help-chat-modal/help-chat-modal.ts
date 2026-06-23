import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HelpCategory } from '../../models/help.models';
import { getTopicsByCategory, getTopicsByRole, searchTopics } from '../../data/help-topics';
import { HelpIcon } from '../help-icon/help-icon';
import { HelpTopicDetail } from '../help-topic-detail/help-topic-detail';

@Component({
  selector: 'app-help-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, HelpIcon, HelpTopicDetail],
  templateUrl: './help-chat-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpChatModal {
  readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<HelpCategory | null>(null);
  readonly selectedTopicId = signal<string | null>(null);

  readonly HelpCategory = HelpCategory;

  readonly categories = [
    { key: HelpCategory.GENERAL, icon: 'info', color: 'bg-slate-500 text-white' },
    { key: HelpCategory.DOCUMENTS, icon: 'file', color: 'bg-teal-500 text-white' },
    { key: HelpCategory.PATIENTS, icon: 'users', color: 'bg-blue-500 text-white' },
    { key: HelpCategory.CLINICAL_HISTORY, icon: 'file-medical', color: 'bg-cyan-600 text-white' },
    { key: HelpCategory.USERS, icon: 'user-plus', color: 'bg-indigo-500 text-white' },
    { key: HelpCategory.DICOM, icon: 'activity', color: 'bg-rose-500 text-white' },
    { key: HelpCategory.REPORTS, icon: 'sliders', color: 'bg-amber-500 text-white' },
    { key: HelpCategory.AUDIT, icon: 'shield', color: 'bg-orange-600 text-white' },
    { key: HelpCategory.SETTINGS, icon: 'settings', color: 'bg-emerald-600 text-white' },
    { key: HelpCategory.BACKUPS, icon: 'database', color: 'bg-purple-500 text-white' }
  ];

  readonly quickActions = computed(() => {
    const roles = this.auth.roles();
    const actions = [
      { titleKey: 'HELP.QUICK.UPLOAD_DOCUMENT', topicId: 'upload_document', roles: [] as string[] },
      { titleKey: 'HELP.QUICK.REGISTER_PATIENT', topicId: 'register_patient', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'] },
      { titleKey: 'HELP.QUICK.VIEW_CLINICAL_HISTORY', topicId: 'view_clinical_history', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'] },
      { titleKey: 'HELP.QUICK.VIEW_DICOM', topicId: 'view_dicom', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'] },
      { titleKey: 'HELP.QUICK.UPLOAD_DICOM', topicId: 'upload_dicom', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'] },
      { titleKey: 'HELP.QUICK.AUDIT_LOG', topicId: 'view_audit_logs', roles: ['ROLE_SUPERUSER'] },
      { titleKey: 'HELP.QUICK.CHANGE_PASSWORD', topicId: 'change_profile_password', roles: [] as string[] }
    ];
    return actions.filter(a => a.roles.length === 0 || a.roles.some(r => roles.includes(r)));
  });

  readonly topics = computed(() => {
    const roles = this.auth.roles();
    const query = this.searchQuery().trim();
    const cat = this.selectedCategory();
    const t = (key: string) => this.translate.instant(key);

    if (query.length >= 2) {
      return searchTopics(query, roles, t);
    } else if (cat) {
      return getTopicsByCategory(cat, roles);
    } else {
      return getTopicsByRole(roles);
    }
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.searchQuery.set('');
        this.selectedCategory.set(null);
        this.selectedTopicId.set(null);
      }
    });
  }

  handleCategoryClick(category: HelpCategory): void {
    this.selectedCategory.set(category);
    this.searchQuery.set('');
  }

  handleBackToCategories(): void {
    this.selectedCategory.set(null);
  }

  handleTopicClick(topicId: string): void {
    this.selectedTopicId.set(topicId);
  }

  handleBackToTopics(): void {
    this.selectedTopicId.set(null);
  }

  getRoleKey(): string {
    const roles = this.auth.roles();
    if (roles.includes('ROLE_SUPERUSER')) return 'HELP.ROLES.SUPERUSER';
    if (roles.includes('ROLE_ADMIN')) return 'HELP.ROLES.ADMIN';
    if (roles.includes('ROLE_MEDICO')) return 'HELP.ROLES.MEDICO';
    if (roles.includes('ROLE_ARCHIVO')) return 'HELP.ROLES.ARCHIVO';
    if (roles.includes('ROLE_DIRECTOR')) return 'HELP.ROLES.DIRECTOR';
    return 'HELP.ROLES.DEFAULT';
  }
}
