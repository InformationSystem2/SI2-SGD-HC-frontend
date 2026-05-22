import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileAlt, faFileMedical, faSpinner, faPencil, faTrash, faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DocumentTemplateService } from '../../services/document-template.service';

@Component({
  selector: 'app-template-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './template-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateList implements OnInit {

  readonly templateService = inject(DocumentTemplateService);
  private router = inject(Router);
  private translate = inject(TranslateService);  

  readonly faFileAlt    = faFileAlt;
  readonly faFileMedical = faFileMedical;
  readonly faSpinner    = faSpinner;
  readonly faPencil     = faPencil;
  readonly faTrash      = faTrash;
  readonly faPlus       = faPlus;

  ngOnInit(): void {
    this.templateService.getAll().subscribe();
  }

  goToCreate(): void {
    this.router.navigate(['/documentos/templates/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/documentos/templates/edit', id]);
  }

  useTemplate(templateId: string): void {
    this.router.navigate(['/documentos/new', templateId]);
  }

  delete(id: string): void {
    const msg = this.translate.instant('TEMPLATES.CONFIRM_DEACTIVATE');
    if (!confirm(msg)) return;
    this.templateService.delete(id).subscribe();
  }
}
