import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Notification,
  Page,
  RegisterPushTokenRequest,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/notifications`;

  readonly unreadCount = signal(0);

  getNotifications(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Notification>>(this.BASE, { params });
  }

  refreshUnreadCount() {
    return this.http.get<{ count: number }>(`${this.BASE}/unread-count`).pipe(
      tap(r => this.unreadCount.set(r.count)),
      catchError(() => { this.unreadCount.set(0); return EMPTY; }),
    );
  }

  markAsRead(id: string) {
    return this.http.patch<void>(`${this.BASE}/${id}/read`, null);
  }

  markAllAsRead() {
    return this.http.post<void>(`${this.BASE}/read-all`, null);
  }

  registerPushToken(req: RegisterPushTokenRequest) {
    return this.http.post<void>(`${this.BASE}/push-tokens`, req);
  }

  deregisterPushToken(token: string) {
    return this.http.delete<void>(`${this.BASE}/push-tokens/${encodeURIComponent(token)}`);
  }
}
