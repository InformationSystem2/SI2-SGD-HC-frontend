import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener,
  inject, OnInit, OnDestroy, signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBell, faSpinner, faCheck, faEye,
  faCircleCheck, faCircleXmark, faClock, faUsers, faPaperPlane, faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { Notification } from '../../../features/notifications/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell implements OnInit, OnDestroy {

  private el       = inject(ElementRef);
  private notifSvc = inject(NotificationService);
  private router   = inject(Router);
  private pollingSub: Subscription | null = null;

  readonly faBell        = faBell;
  readonly faSpinner     = faSpinner;
  readonly faCheck       = faCheck;
  readonly faEye         = faEye;
  readonly faCircleCheck = faCircleCheck;
  readonly faCircleXmark = faCircleXmark;
  readonly faClock       = faClock;
  readonly faUsers       = faUsers;
  readonly faPaperPlane  = faPaperPlane;
  readonly faFileLines   = faFileLines;

  readonly unreadCount   = this.notifSvc.unreadCount;
  readonly showDropdown  = signal(false);
  readonly notifications = signal<Notification[]>([]);
  readonly dropLoading   = signal(false);

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.showDropdown.set(false);
    }
  }

  ngOnInit(): void {
    this.notifSvc.refreshUnreadCount().subscribe();
    this.pollingSub = interval(30_000).subscribe(() => {
      this.notifSvc.refreshUnreadCount().subscribe();
    });
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  toggleBell(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.showDropdown()) {
      this.loadRecent();
    }
    this.showDropdown.update(v => !v);
  }

  private loadRecent(): void {
    this.dropLoading.set(true);
    this.notifSvc.getNotifications(0, 8).subscribe({
      next: page => { this.notifications.set(page.content); this.dropLoading.set(false); },
      error: () => this.dropLoading.set(false),
    });
  }

  markRead(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.notifSvc.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
        this.notifSvc.refreshUnreadCount().subscribe();
      },
    });
  }

  markAllRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notifSvc.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.notifSvc.unreadCount.set(0);
      },
    });
  }

  goToAll(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown.set(false);
    this.router.navigate(['/notifications']);
  }

  goToNotification(n: Notification, event: MouseEvent): void {
    event.stopPropagation();
    if (!n.isRead) {
      this.markRead(n.id, event);
    }
    this.showDropdown.set(false);

    if (['TASK_APPROVED', 'TASK_REJECTED', 'DOC_FINALIZED', 'DOC_REJECTED'].includes(n.type) && n.documentId) {
      this.router.navigate(['/documents/view', n.documentId]);
    } else if (n.workflowId) {
      this.router.navigate(['/tasks/workflow', n.workflowId]);
    } else if (n.documentId) {
      this.router.navigate(['/documents/view', n.documentId]);
    } else {
      this.router.navigate(['/notifications']);
    }
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }
}
