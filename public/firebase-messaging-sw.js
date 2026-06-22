importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAZ6lU3Mrb3ElEk3a7nI7REtAi1_Devtyg',
  authDomain: 'project-5ed4e5c6-d00d-4ed4-86c.firebaseapp.com',
  projectId: 'project-5ed4e5c6-d00d-4ed4-86c',
  storageBucket: 'project-5ed4e5c6-d00d-4ed4-86c.firebasestorage.app',
  messagingSenderId: '776780812382',
  appId: '1:776780812382:web:2ffb46facbc66b1c31e4cf',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SGD-HC SW] Background message:', payload);
  const title = payload.notification?.title || payload.data?.title || 'SGD Health Care';
  const body = payload.notification?.body || payload.data?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
  });
});
