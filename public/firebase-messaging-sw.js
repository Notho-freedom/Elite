// Service Worker pour Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZEsX8Ufs_BJfBWkmN1AyYZrXuEYoTtl4",
  authDomain: "elite-92ea6.firebaseapp.com",
  projectId: "elite-92ea6",
  storageBucket: "elite-92ea6.firebasestorage.app",
  messagingSenderId: "259231999850",
  appId: "1:259231999850:web:eca5565906dd6826d66713",
  measurementId: "G-B42ED1J3MB",
  databaseURL: "https://elite-92ea6-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Obtenir l'instance de messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'Nouveau message';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez reçu un nouveau message',
    icon: '/logoo.png',
    badge: '/logoo.png',
    tag: payload.data?.conversationId || 'message',
    requireInteraction: false,
    silent: false,
    data: payload.data || {},
    actions: [
      {
        action: 'reply',
        title: 'Répondre',
        icon: '/logoo.png'
      },
      {
        action: 'mark-read',
        title: 'Marquer comme lu',
        icon: '/logoo.png'
      }
    ]
  };

  // Afficher la notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Clic sur notification:', event);

  event.notification.close();

  // Gérer les actions de notification
  if (event.action) {
    // Envoyer un message au client principal
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: event.action,
          data: event.notification.data
        });
      });
    });
  } else {
    // Clic simple sur la notification
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          data: event.notification.data
        });
      });
    });
  }

  // Ouvrir l'application si elle n'est pas déjà ouverte
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

// Gérer l'installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Gérer l'activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Gérer les messages du client principal
self.addEventListener('message', (event) => {
  console.log('Message reçu du client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
