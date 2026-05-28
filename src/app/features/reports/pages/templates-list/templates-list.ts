import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';
import {
  faBookmark,
  faShareNodes,
  faTrash,
  faEye,
  faSearch,
  faSpinner,
  faPlus,
  faFolderOpen,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { ReportService, ReportTemplate } from '../../services/report.service';

@Component({
  selector: 'app-report-templates-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './templates-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTemplatesList implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  // Icons
  readonly faBookmark = faBookmark;
  readonly faShareNodes = faShareNodes;
  readonly faTrash = faTrash;
  readonly faEye = faEye;
  readonly faSearch = faSearch;
  readonly faSpinner = faSpinner;
  readonly faPlus = faPlus;
  readonly faFolderOpen = faFolderOpen;
  readonly faBuilding = faBuilding;

  readonly templates = signal<ReportTemplate[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly filteredTemplates = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.templates();
    
    return this.templates().filter(t => 
      t.name.toLowerCase().includes(term) || 
      (t.description || '').toLowerCase().includes(term) ||
      (t.department || '').toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reportService.getTemplates().subscribe({
      next: (data) => {
        this.templates.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las plantillas.');
        this.loading.set(false);
      }
    });
  }

  useTemplate(tpl: ReportTemplate): void {
    this.router.navigate(['/reportes/designer'], { queryParams: { templateId: tpl.id } });
  }

  deleteTemplate(tpl: ReportTemplate, event: Event): void {
    event.stopPropagation();
    if (!confirm(`¿Está seguro de eliminar la plantilla "${tpl.name}"?`)) return;

    this.reportService.deleteTemplate(tpl.id).subscribe({
      next: () => {
        this.templates.update(list => list.filter(t => t.id !== tpl.id));
      },
      error: (err) => {
        this.error.set('No se pudo eliminar la plantilla.');
      }
    });
  }

  goToDesigner(): void {
    this.router.navigate(['/reportes/designer']);
  }
}
