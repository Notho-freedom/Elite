import { discussionsAPI, messagesAPI, authAPI } from './api.js';
import socketService from './socket.js';
import { formatMessageForUI } from './messageFormatter.js';

// Service intégré pour le chat qui utilise API REST + Socket.io
class ChatService {
  constructor() {
    this.currentDiscussion = null;
    this.messageCallbacks = new Map();
    this.typingTimeouts = new Map();
  }

  // Initialiser le service (à appeler après la connexion)
  async initialize() {
    try {
      // Connecter le socket
      const socketConnected = await socketService.connect();
      
      if (socketConnected) {
        this.setupSocketListeners();
      }

      return { success: true, socketConnected };
    } catch (error) {
      console.error('Erreur initialisation ChatService:', error);
      return { success: false, error };
    }
  }

  // Configurer les écouteurs Socket
  setupSocketListeners() {
    // Messages
    socketService.on('new_message', (data) => {
      this.handleNewMessage(data);
    });

    socketService.on('message_sent', (data) => {
      this.handleMessageSent(data);
    });

    // Indicateurs de frappe
    socketService.on('user_typing', (data) => {
      this.handleUserTyping(data);
    });

    // Statuts de lecture
    socketService.on('message_read', (data) => {
      this.handleMessageRead(data);
    });

    // Statuts utilisateur
    socketService.on('user_status_changed', (data) => {
      this.handleUserStatusChanged(data);
    });
  }

  // Gestion des événements Socket

  handleNewMessage(data) {
    const { discussionId, message } = data;
    
    // Formatter le message avec les bonnes propriétés
    const formattedMessage = formatMessageForUI(message);
    
    // Notifier les callbacks
    const callbacks = this.messageCallbacks.get(discussionId);
    if (callbacks) {
      callbacks.forEach(callback => {
        callback({ type: 'new_message', message: formattedMessage, discussionId });
      });
    }

    // Notifier globalement
    this.emit('new_message', { ...data, message: formattedMessage });
  }

  handleMessageSent(data) {
    const { tempId, message } = data;
    
    // Formatter le message confirmé
    const formattedMessage = formatMessageForUI(message);
    
    // Remplacer le message temporaire par le message confirmé
    this.emit('message_confirmed', { tempId, message: formattedMessage });
  }

  handleUserTyping(data) {
    const { discussionId, userId, userName, isTyping } = data;
    
    this.emit('user_typing', { discussionId, userId, userName, isTyping });
    
    // Auto-clear typing après 10 secondes
    if (isTyping) {
      const timeoutKey = `${discussionId}-${userId}`;
      clearTimeout(this.typingTimeouts.get(timeoutKey));
      
      const timeout = setTimeout(() => {
        this.emit('user_typing', { discussionId, userId, userName, isTyping: false });
        this.typingTimeouts.delete(timeoutKey);
      }, 10000);
      
      this.typingTimeouts.set(timeoutKey, timeout);
    }
  }

  handleMessageRead(data) {
    this.emit('message_read', data);
  }

  handleUserStatusChanged(data) {
    this.emit('user_status_changed', data);
  }

  // API Methods - Discussions

  async getDiscussions() {
    try {
      const response = await discussionsAPI.getAll();
      return { success: true, data: response.discussions };
    } catch (error) {
      console.error('Erreur récupération discussions:', error);
      return { success: false, error };
    }
  }

  async getDiscussion(id) {
    try {
      const response = await discussionsAPI.getById(id);
      return { success: true, data: response.discussion };
    } catch (error) {
      console.error('Erreur récupération discussion:', error);
      return { success: false, error };
    }
  }

  async createDiscussion(participantIds, name = null) {
    try {
      const discussionData = {
        participant_ids: participantIds,
        name,
        type: participantIds.length > 1 ? 'group' : 'private'
      };
      
      const response = await discussionsAPI.create(discussionData);
      return { success: true, data: response.discussion };
    } catch (error) {
      console.error('Erreur création discussion:', error);
      return { success: false, error };
    }
  }

  // API Methods - Messages

  async getMessages(discussionId, options = {}) {
    try {
      const response = await messagesAPI.getByDiscussion(discussionId, options);
      return { success: true, data: response.messages, hasMore: response.hasMore };
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return { success: false, error };
    }
  }

  async sendMessage(discussionId, content, options = {}) {
    try {
      // Générer un ID temporaire
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      
      // Créer un message temporaire pour l'UI
      const tempMessage = {
        id: tempId,
        text: content,
        sender: 'me',
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: options.type || 'text',
        status: 'sending',
        isTemp: true
      };

      // Notifier l'UI immédiatement
      this.emit('message_temp', { discussionId, message: tempMessage });

      // Envoyer via Socket pour le temps réel
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(discussionId, content, { 
          ...options, 
          tempId 
        });
      }

      // Envoyer via API comme backup
      let apiResponse = null;
      try {
        if (options.file) {
          apiResponse = await messagesAPI.sendWithFile(discussionId, { content, ...options }, options.file);
        } else {
          apiResponse = await messagesAPI.send(discussionId, { content, ...options });
        }
      } catch (apiError) {
        console.warn('Erreur API envoi message (Socket actif):', apiError);
      }

      return { success: true, tempId, apiResponse: apiResponse?.message };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return { success: false, error };
    }
  }

  async editMessage(messageId, content) {
    try {
      const response = await messagesAPI.update(messageId, content);
      return { success: true, data: response.message };
    } catch (error) {
      console.error('Erreur modification message:', error);
      return { success: false, error };
    }
  }

  async deleteMessage(messageId) {
    try {
      await messagesAPI.delete(messageId);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression message:', error);
      return { success: false, error };
    }
  }

  async addReaction(messageId, emoji) {
    try {
      const response = await messagesAPI.addReaction(messageId, emoji);
      return { success: true, data: response.reaction };
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
      return { success: false, error };
    }
  }

  async removeReaction(messageId, emoji) {
    try {
      await messagesAPI.removeReaction(messageId, emoji);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression réaction:', error);
      return { success: false, error };
    }
  }

  async markAsRead(discussionId) {
    try {
      await messagesAPI.markAsRead(discussionId);
      return { success: true };
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
      return { success: false, error };
    }
  }

  // Socket Methods

  joinDiscussion(discussionId) {
    this.currentDiscussion = discussionId;
    if (socketService.isSocketConnected()) {
      socketService.joinDiscussion(discussionId);
    }
  }

  leaveDiscussion(discussionId) {
    if (this.currentDiscussion === discussionId) {
      this.currentDiscussion = null;
    }
    if (socketService.isSocketConnected()) {
      socketService.leaveDiscussion(discussionId);
    }
  }

  startTyping(discussionId) {
    if (socketService.isSocketConnected()) {
      socketService.startTyping(discussionId);
    }
  }

  stopTyping(discussionId) {
    if (socketService.isSocketConnected()) {
      socketService.stopTyping(discussionId);
    }
  }

  // Event System

  callbacks = new Map();

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event, callback) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.callbacks.delete(event);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.callbacks.get(event);
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

  // Utilitaires

  isConnected() {
    return socketService.isSocketConnected();
  }

  async reconnect() {
    return await socketService.reconnect();
  }

  disconnect() {
    socketService.disconnect();
    this.currentDiscussion = null;
    
    // Nettoyer les timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  getConnectionInfo() {
    return socketService.getConnectionInfo();
  }
}

// Instance singleton
const chatService = new ChatService();

export default chatService;
