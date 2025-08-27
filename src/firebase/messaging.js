import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './config';

export const messagingService = {
  // Demander la permission pour les notifications
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur demande permission notifications:', error);
      return false;
    }
  },

  // Obtenir le token FCM
  async getFCMToken() {
    try {
      const permission = await this.requestPermission();
      if (!permission) {
        throw new Error('Permission de notification refusée');
      }

      const token = await getToken(messaging, {
        vapidKey: 'BEl62iUYgU4XbRLQv2xmxP6S2VO2i63i_0z5JUPuHmQH7eJwqZQJ8qZQJ8qZQJ8' // Clé VAPID pour Elite
      });

      if (token) {
        console.log('Token FCM obtenu:', token);
        return token;
      } else {
        throw new Error('Impossible d\'obtenir le token FCM');
      }
    } catch (error) {
      console.error('Erreur obtention token FCM:', error);
      throw error;
    }
  },

  // Écouter les messages en premier plan
  onMessageReceived(callback) {
    return onMessage(messaging, (payload) => {
      console.log('Message reçu en premier plan:', payload);
      callback(payload);
    });
  },

  // Afficher une notification locale
  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logoo.png',
        badge: '/logoo.png',
        ...options
      });

      // Gérer les clics sur la notification
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Rediriger vers l'application si nécessaire
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    }
  },

  // Créer une notification de message
  showMessageNotification(senderName, message, conversationId) {
    const title = `Nouveau message de ${senderName}`;
    const options = {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/logoo.png',
      badge: '/logoo.png',
      tag: `message-${conversationId}`,
      requireInteraction: false,
      silent: false,
      data: {
        type: 'message',
        conversationId,
        senderName
      },
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

    return this.showNotification(title, options);
  },

  // Créer une notification d'appel
  showCallNotification(callerName, callType = 'audio') {
    const title = `Appel ${callType === 'video' ? 'vidéo' : 'audio'} de ${callerName}`;
    const options = {
      body: 'Appuyez pour répondre',
      icon: '/logoo.png',
      badge: '/logoo.png',
      tag: `call-${callerName}`,
      requireInteraction: true,
      silent: false,
      data: {
        type: 'call',
        callerName,
        callType
      },
      actions: [
        {
          action: 'answer',
          title: 'Répondre',
          icon: '/logoo.png'
        },
        {
          action: 'decline',
          title: 'Refuser',
          icon: '/logoo.png'
        }
      ]
    };

    return this.showNotification(title, options);
  },

  // Créer une notification de statut
  showStatusNotification(userName, statusType) {
    const title = `Statut de ${userName}`;
    let body = '';
    
    switch (statusType) {
      case 'online':
        body = 'est maintenant en ligne';
        break;
      case 'typing':
        body = 'est en train d\'écrire...';
        break;
      case 'offline':
        body = 'est hors ligne';
        break;
      default:
        body = `a mis à jour son statut: ${statusType}`;
    }

    const options = {
      body,
      icon: '/logoo.png',
      badge: '/logoo.png',
      tag: `status-${userName}`,
      requireInteraction: false,
      silent: true,
      data: {
        type: 'status',
        userName,
        statusType
      }
    };

    return this.showNotification(title, options);
  },

  // Gérer les actions de notification
  handleNotificationAction(action, data) {
    switch (action) {
      case 'reply':
        // Ouvrir la conversation et focus sur l'input
        if (data.conversationId) {
          // Émettre un événement personnalisé pour ouvrir la conversation
          window.dispatchEvent(new CustomEvent('openConversation', {
            detail: { conversationId: data.conversationId, focusInput: true }
          }));
        }
        break;

      case 'mark-read':
        // Marquer les messages comme lus
        if (data.conversationId) {
          window.dispatchEvent(new CustomEvent('markMessagesAsRead', {
            detail: { conversationId: data.conversationId }
          }));
        }
        break;

      case 'answer':
        // Répondre à l'appel
        if (data.callerName) {
          window.dispatchEvent(new CustomEvent('answerCall', {
            detail: { callerName: data.callerName, callType: data.callType }
          }));
        }
        break;

      case 'decline':
        // Refuser l'appel
        if (data.callerName) {
          window.dispatchEvent(new CustomEvent('declineCall', {
            detail: { callerName: data.callerName }
          }));
        }
        break;

      default:
        console.log('Action de notification non gérée:', action);
    }
  },

  // Configurer les gestionnaires d'événements de notification
  setupNotificationHandlers() {
    // Gérer les clics sur les actions de notification
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
        this.handleNotificationAction(event.data.action, event.data.data);
      }
    });

    // Gérer les clics sur les notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationAction('click', event.data.data);
        }
      });
    }
  },

  // Vérifier si les notifications sont supportées
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Obtenir l'état des permissions
  getPermissionState() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  // Demander les permissions si nécessaire
  async ensurePermission() {
    if (!this.isSupported()) {
      return false;
    }

    const permission = this.getPermissionState();
    
    if (permission === 'default') {
      return await this.requestPermission();
    }
    
    return permission === 'granted';
  }
};
