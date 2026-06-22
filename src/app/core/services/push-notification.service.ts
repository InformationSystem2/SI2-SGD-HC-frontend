import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../features/notifications/services/notification.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private messaging: Messaging | null = null;

  async initialize(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (!(environment as any).firebase?.appId) {
      console.warn('[Push] Firebase appId no configurado — push notifications deshabilitadas');
      return;
    }

    try {
      if (!getApps().length) initializeApp((environment as any).firebase);
      this.messaging = getMessaging();
      this._listenForeground();
      
      // Si el permiso ya fue concedido previamente, registrar el token automáticamente al iniciar la app
      if (Notification.permission === 'granted') {
        this.requestPermissionAndRegisterToken().catch(console.warn);
      }
    } catch (e) {
      console.warn('[Push] Firebase init failed:', e);
    }
  }

  async requestPermissionAndRegisterToken(): Promise<void> {
    if (!this.messaging) {
      console.warn('[Push] this.messaging es null. ¿Falló initialize()?');
      return;
    }
    try {
      console.log('[Push] Solicitando permiso al navegador...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[Push] Permiso de notificaciones denegado por el navegador (estado:', permission, ')');
        return;
      }
      console.log('[Push] Permiso concedido. Registrando service worker...');

      const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const tokenOptions: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
        serviceWorkerRegistration: sw,
      };
      if ((environment as any).firebase?.vapidKey) {
        tokenOptions.vapidKey = (environment as any).firebase.vapidKey;
      }
      
      console.log('[Push] Solicitando token a Firebase...');
      const token = await getToken(this.messaging, tokenOptions);

      if (token) {
        console.log('[Push] Token obtenido. Enviando al backend...');
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/notifications/push-tokens`, { token, platform: 'WEB' })
        );
        console.log('[Push] Token FCM registrado exitosamente en el backend');
      } else {
        console.warn('[Push] No se generó ningún token desde Firebase');
      }
    } catch (e) {
      console.error('[Push] Error en el flujo de registro de push:', e);
    }
  }

  private _listenForeground(): void {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload: MessagePayload) => {
      const title = payload.notification?.title ?? 'SGD Health Care';
      const body = payload.notification?.body ?? '';
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
      this.injector.get(NotificationService).refreshUnreadCount().subscribe();
    });
  }
}
