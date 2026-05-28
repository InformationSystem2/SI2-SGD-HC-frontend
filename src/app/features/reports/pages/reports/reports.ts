import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  faFileLines,
  faFileExcel,
  faFilePdf,
  faFileCode,
  faPlus,
  faTrash,
  faFilter,
  faFloppyDisk,
  faMagnifyingGlass,
  faSpinner,
  faChevronDown,
  faDownload,
  faEye,
  faTimes,
  faShareNodes,
  faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { ReportService, ReportTypeDefinition, ReportResult, ReportTemplate, ReportFilter } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TranslatePipe],
  templateUrl: './reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);

  // Icons
  readonly faFileLines = faFileLines;
  readonly faFileExcel = faFileExcel;
  readonly faFilePdf = faFilePdf;
  readonly faFileCode = faFileCode;
  readonly faPlus = faPlus;
  readonly faTrash = faTrash;
  readonly faFilter = faFilter;
  readonly faFloppyDisk = faFloppyDisk;
  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faSpinner = faSpinner;
  readonly faChevronDown = faChevronDown;
  readonly faDownload = faDownload;
  readonly faEye = faEye;
  readonly faTimes = faTimes;
  readonly faShareNodes = faShareNodes;
  readonly faBookmark = faBookmark;

  readonly Math = Math;

  // Catalog and Templates
  readonly catalog = signal<ReportTypeDefinition[]>([]);
  readonly templates = signal<ReportTemplate[]>([]);
  readonly loadingCatalog = signal(false);
  readonly loadingTemplates = signal(false);

  // Selection state
  readonly selectedReportKey = signal<string>('');
  readonly selectedReport = computed(() => {
    return this.catalog().find(r => r.key === this.selectedReportKey());
  });

  // Track loaded template (for updates)
  readonly loadedTemplate = signal<ReportTemplate | null>(null);

  // Dynamic QBE configuration
  readonly selectedFields = signal<string[]>([]);
  readonly filters = signal<ReportFilter[]>([]);
  readonly sortField = signal<string>('');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');

  // Execution state & preview
  readonly previewResult = signal<ReportResult | null>(null);
  readonly running = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(15);
  readonly error = signal<string | null>(null);

  // Template Modal
  readonly showSaveModal = signal(false);
  readonly templateName = signal('');
  readonly templateDescription = signal('');
  readonly templateDepartment = signal('');
  readonly templateIsShared = signal(false);
  readonly savingTemplate = signal(false);

  translateColumn(col: string, fallback?: string): string {
    const key = `REPORTS.FIELDS.${col}`;
    const translated = this.translateService.instant(key);
    if (translated === key) {
      return fallback || col;
    }
    return translated;
  }

  translateReportType(key: string, fallback?: string): string {
    const translationKey = `REPORTS.TYPES.${key}`;
    const translated = this.translateService.instant(translationKey);
    if (translated === translationKey) {
      return fallback || key;
    }
    return translated;
  }

  translateCategory(cat: string): string {
    const key = `REPORTS.CATEGORY.${cat}`;
    const translated = this.translateService.instant(key);
    if (translated === key) {
      return cat;
    }
    return translated;
  }

  ngOnInit(): void {
    this.loadCatalog();
    this.loadTemplatesAndCheckQueryParam();
  }

  loadCatalog(): void {
    this.loadingCatalog.set(true);
    this.reportService.getCatalog().subscribe({
      next: (data) => {
        this.catalog.set(data);
        this.loadingCatalog.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el catálogo de reportes');
        this.loadingCatalog.set(false);
      }
    });
  }

  loadTemplatesAndCheckQueryParam(): void {
    this.loadingTemplates.set(true);
    this.reportService.getTemplates().subscribe({
      next: (data) => {
        this.templates.set(data);
        this.loadingTemplates.set(false);

        // Read query parameters to check if we need to load a template directly
        this.route.queryParams.subscribe(params => {
          const tplId = params['templateId'];
          if (tplId) {
            const tpl = data.find(t => t.id === tplId);
            if (tpl) {
              this.loadTemplate(tpl);
            }
          }
        });
      },
      error: (err) => {
        this.error.set('Error al cargar plantillas QBE');
        this.loadingTemplates.set(false);
      }
    });
  }

  onReportTypeChange(key: string): void {
    this.selectedReportKey.set(key);
    this.previewResult.set(null);
    this.error.set(null);
    this.page.set(0);
    this.loadedTemplate.set(null);

    const report = this.selectedReport();
    if (report) {
      this.selectedFields.set(report.fields.map(f => f.key));
      this.filters.set([]);
      this.sortField.set('');
      this.sortOrder.set('asc');
    } else {
      this.selectedFields.set([]);
      this.filters.set([]);
    }
  }

  toggleField(fieldKey: string): void {
    const fields = [...this.selectedFields()];
    const idx = fields.indexOf(fieldKey);
    if (idx > -1) {
      fields.splice(idx, 1);
    } else {
      fields.push(fieldKey);
    }
    this.selectedFields.set(fields);
  }

  selectAll(): void {
    const report = this.selectedReport();
    if (report) {
      this.selectedFields.set(report.fields.map(f => f.key));
    }
  }

  deselectAll(): void {
    this.selectedFields.set([]);
  }

  getFieldType(fieldKey: string): string {
    const report = this.selectedReport();
    if (!report) return 'STRING';
    const field = report.fields.find(f => f.key === fieldKey);
    return field ? field.type : 'STRING';
  }

  getFieldOptions(fieldKey: string): { value: string; label: string }[] | null {
    if (fieldKey === 'gender') {
      return [
        { value: 'MALE', label: 'Masculino' },
        { value: 'FEMALE', label: 'Femenino' }
      ];
    }
    if (fieldKey === 'documentType') {
      return [
        { value: 'CI', label: 'Cédula de Identidad (CI)' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ];
    }
    if (fieldKey === 'status') {
      return [
        { value: 'DRAFT', label: 'Borrador' },
        { value: 'PENDING_REVIEW', label: 'Pendiente de revisión' },
        { value: 'REJECTED', label: 'Rechazado' },
        { value: 'FINALIZED', label: 'Finalizado' }
      ];
    }
    return null;
  }

  addFilter(): void {
    const report = this.selectedReport();
    if (!report || report.fields.length === 0) return;
    
    const firstField = report.fields[0];
    this.filters.update(f => [...f, {
      field: firstField.key,
      operator: 'EQ',
      value: ''
    }]);
  }

  removeFilter(idx: number): void {
    this.filters.update(f => {
      const copy = [...f];
      copy.splice(idx, 1);
      return copy;
    });
  }

  onFilterFieldChange(idx: number, newFieldKey: string): void {
    this.filters.update(f => {
      const copy = [...f];
      copy[idx].field = newFieldKey;
      copy[idx].value = '';
      return copy;
    });
  }

  getOperatorsForField(fieldKey: string): { key: string; label: string }[] {
    const report = this.selectedReport();
    if (!report) return [];
    const field = report.fields.find(f => f.key === fieldKey);
    if (!field) return [];

    const generalOps = [
      { key: 'EQ', label: '=' },
      { key: 'NE', label: '≠' },
      { key: 'IS_NULL', label: 'Es Nulo' },
      { key: 'IS_NOT_NULL', label: 'No es Nulo' }
    ];

    if (field.type === 'STRING') {
      return [
        { key: 'LIKE', label: 'Contiene' },
        ...generalOps
      ];
    }

    if (field.type === 'NUMBER' || field.type === 'DATE') {
      return [
        ...generalOps,
        { key: 'GT', label: '>' },
        { key: 'GTE', label: '≥' },
        { key: 'LT', label: '<' },
        { key: 'LTE', label: '≤' }
      ];
    }

    return generalOps;
  }

  runReport(): void {
    if (!this.selectedReportKey()) return;

    this.running.set(true);
    this.error.set(null);

    const req = {
      reportType: this.selectedReportKey(),
      selectedFields: this.selectedFields(),
      filters: this.filters()
        .filter(f => f.field && f.operator)
        .map(f => ({
          field: f.field,
          operator: f.operator,
          value: (f.operator !== 'IS_NULL' && f.operator !== 'IS_NOT_NULL') ? f.value : undefined
        })),
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder(),
      dateFrom: this.dateFrom() ? `${this.dateFrom()}T00:00:00` : undefined,
      dateTo: this.dateTo() ? `${this.dateTo()}T23:59:59` : undefined,
      limit: this.pageSize(),
      offset: this.page() * this.pageSize()
    };

    this.reportService.runReport(req).subscribe({
      next: (res) => {
        this.previewResult.set(res);
        this.running.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Error al procesar el reporte');
        this.running.set(false);
      }
    });
  }

  exportReport(format: 'pdf' | 'excel' | 'html' | 'json'): void {
    if (!this.selectedReportKey()) return;

    this.running.set(true);

    const translatedLabels: Record<string, string> = {};
    const report = this.selectedReport();
    if (report) {
      for (const field of report.fields) {
        translatedLabels[field.key] = this.translateColumn(field.key, field.label);
      }
    }

    const req = {
      reportType: this.selectedReportKey(),
      selectedFields: this.selectedFields(),
      filters: this.filters()
        .filter(f => f.field && f.operator)
        .map(f => ({
          field: f.field,
          operator: f.operator,
          value: (f.operator !== 'IS_NULL' && f.operator !== 'IS_NOT_NULL') ? f.value : undefined
        })),
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder(),
      dateFrom: this.dateFrom() ? `${this.dateFrom()}T00:00:00` : undefined,
      dateTo: this.dateTo() ? `${this.dateTo()}T23:59:59` : undefined,
      translatedTitle: this.translateReportType(this.selectedReportKey(), report?.label),
      translatedCategory: report ? this.translateCategory(report.category) : undefined,
      translatedLabels
    };

    this.reportService.exportReport(req, format).subscribe({
      next: (blob) => {
        let fileType = 'pdf';
        let mimeType = 'application/pdf';

        if (format === 'excel') {
          fileType = 'xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (format === 'html') {
          fileType = 'html';
          mimeType = 'text/html';
        } else if (format === 'json') {
          fileType = 'json';
          mimeType = 'application/json';
        }
        
        const fileBlob = new Blob([blob], { type: mimeType });
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${this.selectedReportKey()}_${new Date().getTime()}.${fileType}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.running.set(false);
      },
      error: (err) => {
        this.error.set('Error al descargar el archivo de reporte');
        this.running.set(false);
      }
    });
  }

  // --- Saved Templates QBE ---

  openSaveTemplateModal(): void {
    if (!this.selectedReportKey()) return;
    this.templateName.set(this.loadedTemplate()?.name || '');
    this.templateDescription.set(this.loadedTemplate()?.description || '');
    this.templateDepartment.set(this.loadedTemplate()?.department || '');
    this.templateIsShared.set(this.loadedTemplate()?.isShared || false);
    this.showSaveModal.set(true);
  }

  saveTemplate(): void {
    if (!this.templateName().trim()) return;

    this.savingTemplate.set(true);
    const req = {
      name: this.templateName(),
      description: this.templateDescription(),
      department: this.templateDepartment(),
      reportType: this.selectedReportKey(),
      selectedFields: this.selectedFields(),
      filters: this.filters()
        .filter(f => f.field && f.operator)
        .map(f => ({
          field: f.field,
          operator: f.operator,
          value: (f.operator !== 'IS_NULL' && f.operator !== 'IS_NOT_NULL') ? f.value : undefined
        })),
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder(),
      isShared: this.templateIsShared()
    };

    this.reportService.createTemplate(req).subscribe({
      next: (tpl) => {
        this.templates.update(list => [tpl, ...list]);
        this.loadedTemplate.set(tpl);
        this.savingTemplate.set(false);
        this.showSaveModal.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Error al guardar la plantilla');
        this.savingTemplate.set(false);
      }
    });
  }

  updateTemplate(): void {
    const activeTpl = this.loadedTemplate();
    if (!activeTpl) return;

    this.savingTemplate.set(true);
    const req = {
      name: this.templateName() || activeTpl.name,
      description: this.templateDescription() || activeTpl.description,
      department: this.templateDepartment() || activeTpl.department,
      reportType: this.selectedReportKey(),
      selectedFields: this.selectedFields(),
      filters: this.filters()
        .filter(f => f.field && f.operator)
        .map(f => ({
          field: f.field,
          operator: f.operator,
          value: (f.operator !== 'IS_NULL' && f.operator !== 'IS_NOT_NULL') ? f.value : undefined
        })),
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder(),
      isShared: this.templateIsShared() !== undefined ? this.templateIsShared() : activeTpl.isShared
    };

    this.reportService.updateTemplate(activeTpl.id, req).subscribe({
      next: (updated) => {
        this.templates.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.loadedTemplate.set(updated);
        this.savingTemplate.set(false);
        this.showSaveModal.set(false);
        alert("Plantilla QBE actualizada correctamente.");
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Error al actualizar la plantilla QBE');
        this.savingTemplate.set(false);
      }
    });
  }

  loadTemplate(tpl: ReportTemplate): void {
    this.selectedReportKey.set(tpl.reportType);
    this.selectedFields.set(tpl.selectedFields);
    this.filters.set(tpl.filters || []);
    this.sortField.set(tpl.sortField || '');
    this.sortOrder.set((tpl.sortOrder as 'asc' | 'desc') || 'asc');
    this.loadedTemplate.set(tpl);
    this.previewResult.set(null);
    this.page.set(0);
    this.runReport();
  }

  deleteTemplate(tpl: ReportTemplate): void {
    if (!confirm(`¿Está seguro de eliminar la plantilla "${tpl.name}"?`)) return;

    this.reportService.deleteTemplate(tpl.id).subscribe({
      next: () => {
        this.templates.update(list => list.filter(t => t.id !== tpl.id));
        if (this.loadedTemplate()?.id === tpl.id) {
          this.loadedTemplate.set(null);
        }
      },
      error: (err) => {
        this.error.set('No se pudo eliminar la plantilla');
      }
    });
  }

  // Pagination helpers
  get totalPages(): number {
    const res = this.previewResult();
    if (!res) return 1;
    return Math.ceil(res.total / this.pageSize()) || 1;
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.runReport();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages - 1) {
      this.page.update(p => p + 1);
      this.runReport();
    }
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.runReport();
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur = this.page();
    const start = Math.max(0, Math.min(cur - 2, total - 5));
    const end = Math.min(total - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
