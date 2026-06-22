import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTopicById } from '../../data/help-topics';
import { HelpIcon } from '../help-icon/help-icon';

@Component({
  selector: 'app-help-topic-detail',
  standalone: true,
  imports: [CommonModule, HelpIcon],
  templateUrl: './help-topic-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpTopicDetail {
  readonly topicId = input.required<string>();
  readonly back = output<void>();
  readonly close = output<void>();

  readonly topic = computed(() => {
    const id = this.topicId();
    return getTopicById(id);
  });

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Uso General': 'from-slate-600 to-slate-500',
      'Documentos': 'from-teal-600 to-teal-500',
      'Pacientes': 'from-blue-600 to-blue-500',
      'Usuarios y Roles': 'from-indigo-600 to-indigo-500',
      'Imágenes DICOM': 'from-rose-600 to-rose-500',
      'Reportes y Auditoría': 'from-amber-600 to-amber-500',
      'Copias de Seguridad': 'from-purple-600 to-purple-500'
    };
    return colors[category] || 'from-teal-600 to-teal-500';
  }

  contactSupport(): void {
    alert('Función de contacto de soporte en desarrollo. Por favor, comunícate con el Administrador de TI.');
  }
}
