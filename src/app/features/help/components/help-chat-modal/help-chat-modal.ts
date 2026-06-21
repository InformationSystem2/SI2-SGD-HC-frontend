import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HelpCategory } from '../../models/help.models';
import { getTopicsByCategory, getTopicsByRole, searchTopics } from '../../data/help-topics';
import { HelpIcon } from '../help-icon/help-icon';
import { HelpTopicDetail } from '../help-topic-detail/help-topic-detail';

@Component({
  selector: 'app-help-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpIcon, HelpTopicDetail],
  templateUrl: './help-chat-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpChatModal {
  readonly auth = inject(AuthService);
  
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<HelpCategory | null>(null);
  readonly selectedTopicId = signal<string | null>(null);

  readonly HelpCategory = HelpCategory;

  readonly categories = [
    { name: HelpCategory.GENERAL, icon: 'info', color: 'bg-slate-500 text-white' },
    { name: HelpCategory.DOCUMENTS, icon: 'file', color: 'bg-teal-500 text-white' },
    { name: HelpCategory.PATIENTS, icon: 'users', color: 'bg-blue-500 text-white' },
    { name: HelpCategory.USERS, icon: 'user-plus', color: 'bg-indigo-500 text-white' },
    { name: HelpCategory.DICOM, icon: 'activity', color: 'bg-rose-500 text-white' },
    { name: HelpCategory.REPORTS, icon: 'sliders', color: 'bg-amber-500 text-white' },
    { name: HelpCategory.BACKUPS, icon: 'database', color: 'bg-purple-500 text-white' }
  ];

  readonly quickActions = computed(() => {
    const roles = this.auth.roles();
    const actions = [
      { title: 'Subir Documento', topicId: 'upload_document', roles: [] as string[] },
      { title: 'Registrar Paciente', topicId: 'register_patient', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'] },
      { title: 'Ver DICOM', topicId: 'view_dicom', roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'] },
      { title: 'Cambiar Clave', topicId: 'change_profile_password', roles: [] as string[] }
    ];
    return actions.filter(a => a.roles.length === 0 || a.roles.some(r => roles.includes(r)));
  });

  readonly topics = computed(() => {
    const roles = this.auth.roles();
    const query = this.searchQuery().trim();
    const cat = this.selectedCategory();

    if (query.length >= 2) {
      return searchTopics(query, roles);
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

  getRolesString(): string {
    const roles = this.auth.roles();
    if (roles.includes('ROLE_SUPERUSER')) return 'Superusuario';
    if (roles.includes('ROLE_ADMIN')) return 'Administrador';
    if (roles.includes('ROLE_MEDICO')) return 'Médico';
    if (roles.includes('ROLE_ARCHIVO')) return 'Archivo / Admisión';
    if (roles.includes('ROLE_DIRECTOR')) return 'Director';
    return 'Usuario';
  }
}
