import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner, faPaperPlane, faXmark, faFileLines, faCalendar, faUser, faPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { WorkflowService } from '../../services/workflow.service';
import { WorkflowCreateRequest } from '../../models/workflow.model';
import { DocumentService } from '../../../documents/services/document.service';
import { UserService } from '../../../users/services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-workflow-create',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule, TranslatePipe, TranslateModule],
  templateUrl: './workflow-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowCreatePage implements OnInit {

  private workflowService = inject(WorkflowService);
  private documentService = inject(DocumentService);
  private userService     = inject(UserService);
  private router          = inject(Router);
  private auth            = inject(AuthService);

  readonly faSpinner   = faSpinner;
  readonly faPaperPlane = faPaperPlane;
  readonly faXmark     = faXmark;
  readonly faFileLines = faFileLines;
  readonly faCalendar  = faCalendar;
  readonly faUser      = faUser;
  readonly faPlus      = faPlus;
  readonly faTrash     = faTrash;

  readonly title       = signal('');
  readonly message     = signal('');
  readonly assigneeId  = signal('');
  readonly priority    = signal(2);
  readonly dueDate     = signal('');
  readonly sendEmail   = signal(false);
  readonly selectedDocIds = signal<string[]>([]);

  readonly documents   = this.documentService.documents;
  readonly users       = computed(() => {
    const me = this.auth.username();
    return this.userService.users().filter(u => u.username !== me);
  });
  readonly loading     = signal(false);
  readonly error       = signal<string | null>(null);
  readonly showDocPicker = signal(false);
  readonly docSearch   = signal('');

  readonly filteredDocs = computed(() => {
    const docs = this.documents();
    const q = this.docSearch().toLowerCase().trim();
    if (!q) return docs;
    return docs.filter(d =>
      (d.templateName && d.templateName.toLowerCase().includes(q)) ||
      (d.patientName && d.patientName.toLowerCase().includes(q)) ||
      (d.id && d.id.toLowerCase().includes(q)) ||
      (d.status && d.status.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    this.documentService.getAll().subscribe();
    this.userService.getUsers().subscribe();
  }

  toggleDoc(docId: string) {
    this.selectedDocIds.update(ids =>
      ids.includes(docId) ? ids.filter(id => id !== docId) : [...ids, docId]
    );
  }

  docName(docId: string): string {
    const doc = this.documents().find(d => d.id === docId);
    if (!doc) return docId.substring(0, 8);
    return doc.templateName || doc.patientName || docId.substring(0, 8);
  }

  submit() {
    if (!this.assigneeId() || this.selectedDocIds().length === 0) return;

    this.loading.set(true);
    this.error.set(null);

    let finalDueDate: string | undefined = undefined;
    if (this.dueDate()) {
      const d = this.dueDate();
      if (d.length === 10) {
        finalDueDate = new Date(`${d}T23:59:59`).toISOString();
      } else {
        finalDueDate = new Date(d).toISOString();
      }
    }

    const req: WorkflowCreateRequest = {
      title: this.title(),
      message: this.message(),
      assigneeId: this.assigneeId(),
      priority: this.priority(),
      dueDate: finalDueDate,
      documentIds: this.selectedDocIds(),
      sendEmailNotifications: this.sendEmail(),
    };

    this.workflowService.createWorkflow(req).subscribe({
      next: (wf) => {
        this.loading.set(false);
        this.router.navigate(['/tasks/workflow', wf.id]);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al crear flujo');
        this.loading.set(false);
      },
    });
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}
