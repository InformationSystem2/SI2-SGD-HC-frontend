import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBell, faSpinner, faCheck,
  faCircleCheck, faCircleXmark, faClock, faUsers, faPaperPlane, faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { Notification, Page } from '../../models/notification.model';

@Component({
  selector: 'app-notification-list',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './notification-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationList implements OnInit {

  private notifSvc = inject(NotificationService);

  readonly faBell        = faBell;
  readonly faSpinner     = faSpinner;
  readonly faCheck       = faCheck;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faClock       = faClock;
  readonly faUsers       = faUsers;
  readonly faPaperPlane  = faPaperPlane;
  readonly faFileLines   = faFileLines;

  readonly page        = signal<Page<Notification> | null>(null);
  readonly currentPage = signal(0);
  readonly pageLoading = signal(false);
  readonly markingAll  = signal(false);

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(p: number): void {
    this.pageLoading.set(true);
    this.currentPage.set(p);
    this.notifSvc.getNotifications(p, 20).subscribe({
      next: page => { this.page.set(page); this.pageLoading.set(false); },
      error: () => this.pageLoading.set(false),
    });
  }

  markAsRead(id: string): void {
    this.notifSvc.markAsRead(id).subscribe({
      next: () => {
        this.page.update(p => p
          ? { ...p, content: p.content.map(n => n.id === id ? { ...n, isRead: true } : n) }
          : p
        );
        this.notifSvc.refreshUnreadCount().subscribe();
      },
    });
  }

  markAllAsRead(): void {
    this.markingAll.set(true);
    this.notifSvc.markAllAsRead().subscribe({
      next: () => {
        this.page.update(p => p
          ? { ...p, content: p.content.map(n => ({ ...n, isRead: true })) }
          : p
        );
        this.notifSvc.unreadCount.set(0);
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false),
    });
  }

  prevPage(): void {
    const cur = this.currentPage();
    if (cur > 0) this.loadPage(cur - 1);
  }

  nextPage(): void {
    const p = this.page();
    if (p && !p.last) this.loadPage(this.currentPage() + 1);
  }

  notifIcon(type: string): any {
    return ({
      TASK_ASSIGNED:  faUsers,
      TASK_COMPLETED: faCircleCheck,
      TASK_APPROVED:  faCircleCheck,
      TASK_REJECTED:  faCircleXmark,
      TASK_OVERDUE:   faClock,
      DOC_REVIEW:     faPaperPlane,
      DOC_FINALIZED:  faFileLines,
      DOC_REJECTED:   faCircleXmark,
    } as Record<string, any>)[type] ?? faBell;
  }

  notifIconClass(type: string): string {
    return ({
      TASK_APPROVED:  'text-green-600',
      DOC_FINALIZED:  'text-green-600',
      TASK_REJECTED:  'text-red-600',
      DOC_REJECTED:   'text-red-600',
      TASK_OVERDUE:   'text-amber-500',
    } as Record<string, string>)[type] ?? 'text-hc-primary';
  }

  notifTypeLabel(type: string): string {
    return ({
      TASK_ASSIGNED:  'Tarea asignada',
      TASK_COMPLETED: 'Tarea completada',
      TASK_APPROVED:  'Documento aprobado',
      TASK_REJECTED:  'Tarea rechazada',
      TASK_OVERDUE:   'Tarea vencida',
      DOC_REVIEW:     'En revisión',
      DOC_FINALIZED:  'Documento finalizado',
      DOC_REJECTED:   'Documento rechazado',
    } as Record<string, string>)[type] ?? type;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
