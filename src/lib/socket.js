import { io } from 'socket.io-client';
import { supabase } from './supabase.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventCallbacks = new Map();
  }

  // Initialiser la connexion
  async connect() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('Pas de token d\'authentification, connexion Socket impossible');
        return false;
      }

      const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      this.socket = io(SOCKET_URL, {
        auth: {
          token: session.access_token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupEventHandlers();
      return true;
    } catch (error) {
      console.error('Erreur connexion Socket:', error);
      return false;
    }
  }

  // Configurer les gestionnaires d'événements
  setupEventHandlers() {
    if (!this.socket) return;

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ Socket connecté');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket déconnecté:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Nombre maximum de tentatives de reconnexion atteint');
        this.emit('connection_failed');
      }
    });

    // Événements de chat
    this.socket.on('new_message', (data) => {
      console.log('💬 Nouveau message reçu:', data);
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message envoyé confirmé:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('user_status_changed', (data) => {
      this.emit('user_status_changed', data);
    });

    // Événements d'appel
    this.socket.on('call_signal', (data) => {
      this.emit('call_signal', data);
    });

    // Événements d'erreur
    this.socket.on('error', (error) => {
      console.error('❌ Erreur Socket:', error);
      this.emit('error', error);
    });
  }

  // Déconnecter
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('👋 Socket déconnecté manuellement');
    }
  }

  // Émettre un événement
  emit(event, data) {
    // Émettre vers le serveur
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }

    // Émettre vers les callbacks locaux
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur callback ${event}:`, error);
        }
      });
    }
  }

  // Écouter un événement
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event).add(callback);

    // Retourner une fonction de nettoyage
    return () => {
      this.off(event, callback);
    };
  }

  // Arrêter d'écouter un événement
  off(event, callback) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventCallbacks.delete(event);
      }
    }
  }

  // Méthodes spécialisées pour le chat

  // Joindre une discussion
  joinDiscussion(discussionId) {
    this.emit('join_discussion', { discussionId });
  }

  // Quitter une discussion
  leaveDiscussion(discussionId) {
    this.emit('leave_discussion', { discussionId });
  }

  // Envoyer un message
  sendMessage(discussionId, content, options = {}) {
    const data = {
      discussionId,
      content,
      messageType: options.type || 'text',
      replyToId: options.replyToId,
      tempId: options.tempId || `temp_${Date.now()}`
    };
    
    this.emit('send_message', data);
    return data.tempId;
  }

  // Indicateurs de frappe
  startTyping(discussionId) {
    this.emit('typing_start', { discussionId });
  }

  stopTyping(discussionId) {
    this.emit('typing_stop', { discussionId });
  }

  // Marquer un message comme lu
  markMessageAsRead(discussionId, messageId) {
    this.emit('message_read', { discussionId, messageId });
  }

  // Mettre à jour le statut utilisateur
  updateUserStatus(status, isOnline) {
    this.emit('user_status', { status, isOnline });
  }

  // Signalisation d'appel
  sendCallSignal(discussionId, signal, type, targetUserId = null) {
    this.emit('call_signal', {
      discussionId,
      signal,
      type,
      targetUserId
    });
  }

  // Utilitaires

  // Vérifier l'état de la connexion
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Obtenir les détails de la connexion
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Reconnecter manuellement
  async reconnect() {
    if (this.socket) {
      this.disconnect();
    }
    return await this.connect();
  }
}

// Instance singleton
const socketService = new SocketService();

// Le hook React sera dans un fichier séparé pour éviter les dépendances

export default socketService;
