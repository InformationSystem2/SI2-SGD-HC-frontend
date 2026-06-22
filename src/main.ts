import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { PushNotificationService } from './app/core/services/push-notification.service';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    appRef.injector.get(PushNotificationService).initialize();
  })
  .catch((err) => console.error(err));
