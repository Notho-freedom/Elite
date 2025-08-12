import { supabase } from '../lib/supabase';
import userService from './userService';
import chatService from './chatService';
import notificationService from './notificationService';

/**
 * Service pour la gestion centralisée du temps réel
 * Coordonne tous les abonnements temps réel de l'application
 */
class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.presenceChannel = null;
    this.currentUserId = null;
    this.isInitialized = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialiser le service temps réel
   * @param {string} userId - ID de l'utilisateur connecté
   */
  async initialize(userId) {
    try {
      if (this.isInitialized && this.currentUserId === userId) {
        console.log('⚡ Service temps réel déjà initialisé');
        return { success: true };
      }

      console.log('🔄 Initialisation service temps réel pour:', userId);

      this.currentUserId = userId;

      // Initialiser les services dépendants
      await notificationService.initialize(userId);

      // Configurer la présence utilisateur
      await this.setupUserPresence(userId);

      // S'abonner aux événements globaux
      await this.subscribeToGlobalEvents(userId);

      // Marquer comme initialisé
      this.isInitialized = true;

      console.log('✅ Service temps réel initialisé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur initialisation temps réel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Configurer la présence utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  async setupUserPresence(userId) {
    try {
      // Mettre à jour le statut en ligne
      await userService.updateOnlineStatus(userId, true, 'online');

      // Canal de présence Supabase
      this.presenceChannel = supabase.channel('online-users')
        .on('presence', { event: 'sync' }, () => {
          const state = this.presenceChannel.presenceState();
          this.handlePresenceSync(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('👤 Utilisateur en ligne:', key);
          this.handleUserJoin(key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('👤 Utilisateur hors ligne:', key);
          this.handleUserLeave(key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await this.presenceChannel.track({
              user_id: userId,
              online_at: new Date().toISOString()
            });
          }
        });

      // Gérer la déconnexion au déchargement de la page
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

      // Gérer la visibilité de la page
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          userService.updateOnlineStatus(userId, true, 'away');
        } else {
          userService.updateOnlineStatus(userId, true, 'online');
        }
      });

    } catch (error) {
      console.error('❌ Erreur configuration présence:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux événements globaux
   * @param {string} userId - ID de l'utilisateur
   */
  async subscribeToGlobalEvents(userId) {
    try {
      // Notifications globales
      const notificationSub = supabase
        .channel('global-notifications')
        .on('broadcast', { event: 'notification' }, (payload) => {
          if (payload.user_id === userId || payload.target_users?.includes(userId)) {
            this.handleGlobalNotification(payload);
          }
        })
        .subscribe();

      this.subscriptions.set('global-notifications', notificationSub);

      // Mises à jour utilisateurs
      const userUpdatesSub = supabase
        .channel('user-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        }, (payload) => {
          this.handleUserUpdate(payload.new, payload.old);
        })
        .subscribe();

      this.subscriptions.set('user-updates', userUpdatesSub);

      // Nouvelles discussions
      const discussionsSub = supabase
        .channel('new-discussions')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_participants',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          this.handleNewDiscussion(payload.new);
        })
        .subscribe();

      this.subscriptions.set('new-discussions', discussionsSub);

    } catch (error) {
      console.error('❌ Erreur abonnement événements globaux:', error);
      throw error;
    }
  }

  /**
   * S'abonner à une discussion spécifique
   * @param {string} discussionId - ID de la discussion
   * @param {Object} callbacks - Callbacks pour les événements
   */
  async subscribeToDiscussion(discussionId, callbacks = {}) {
    try {
      const channelName = `discussion:${discussionId}`;
      
      // Si déjà abonné, ne pas recréer
      if (this.subscriptions.has(channelName)) {
        console.log('⚡ Déjà abonné à la discussion:', discussionId);
        return { success: true };
      }

      // Utiliser chatService pour les messages
      await chatService.subscribeToDiscussion(discussionId, this.currentUserId, {
        onNewMessage: callbacks.onNewMessage,
        onMessageUpdate: callbacks.onMessageUpdate,
        onTypingUpdate: callbacks.onTypingUpdate,
        onReactionUpdate: callbacks.onReactionUpdate
      });

      // Abonnement supplémentaire pour les changements de participants
      const participantsSub = supabase
        .channel(`${channelName}:participants`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'discussion_participants',
          filter: `discussion_id=eq.${discussionId}`
        }, (payload) => {
          if (callbacks.onParticipantChange) {
            callbacks.onParticipantChange(payload);
          }
        })
        .subscribe();

      this.subscriptions.set(`${channelName}:participants`, participantsSub);

      console.log('✅ Abonné à la discussion:', discussionId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur abonnement discussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Se désabonner d'une discussion
   * @param {string} discussionId - ID de la discussion
   */
  async unsubscribeFromDiscussion(discussionId) {
    try {
      const channelName = `discussion:${discussionId}`;

      // Désabonner via chatService
      chatService.unsubscribeFromDiscussion(discussionId);

      // Désabonner les participants
      const participantsKey = `${channelName}:participants`;
      if (this.subscriptions.has(participantsKey)) {
        const sub = this.subscriptions.get(participantsKey);
        await supabase.removeChannel(sub);
        this.subscriptions.delete(participantsKey);
      }

      console.log('🔌 Désabonné de la discussion:', discussionId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur désabonnement discussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gérer la synchronisation de présence
   * @param {Object} state - État de présence
   */
  handlePresenceSync(state) {
    const onlineUsers = [];
    
    for (const [key, presences] of Object.entries(state)) {
      if (presences.length > 0) {
        const presence = presences[0];
        onlineUsers.push(presence.user_id);
      }
    }

    // Émettre un événement pour l'UI
    window.dispatchEvent(new CustomEvent('presenceSync', {
      detail: { onlineUsers }
    }));
  }

  /**
   * Gérer l'arrivée d'un utilisateur
   * @param {string} key - Clé de présence
   * @param {Array} presences - Données de présence
   */
  async handleUserJoin(key, presences) {
    if (presences.length > 0) {
      const userId = presences[0].user_id;
      
      // Mettre à jour le statut en base
      await supabase
        .from('users')
        .update({
          is_online: true,
          status: 'online',
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);

      // Émettre un événement
      window.dispatchEvent(new CustomEvent('userOnline', {
        detail: { userId }
      }));
    }
  }

  /**
   * Gérer le départ d'un utilisateur
   * @param {string} key - Clé de présence
   * @param {Array} presences - Données de présence
   */
  async handleUserLeave(key, presences) {
    if (presences.length > 0) {
      const userId = presences[0].user_id;
      
      // Mettre à jour le statut en base
      await supabase
        .from('users')
        .update({
          is_online: false,
          status: 'offline',
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);

      // Émettre un événement
      window.dispatchEvent(new CustomEvent('userOffline', {
        detail: { userId }
      }));
    }
  }

  /**
   * Gérer une notification globale
   * @param {Object} payload - Données de la notification
   */
  handleGlobalNotification(payload) {
    // Traiter selon le type
    switch (payload.type) {
      case 'system_update':
        this.showSystemUpdate(payload);
        break;
      case 'broadcast_message':
        this.showBroadcastMessage(payload);
        break;
      default:
        console.log('📢 Notification globale:', payload);
    }
  }

  /**
   * Gérer une mise à jour utilisateur
   * @param {Object} newData - Nouvelles données
   * @param {Object} oldData - Anciennes données
   */
  handleUserUpdate(newData, oldData) {
    // Émettre un événement si le statut a changé
    if (newData.status !== oldData.status || newData.is_online !== oldData.is_online) {
      window.dispatchEvent(new CustomEvent('userStatusChanged', {
        detail: {
          userId: newData.id,
          status: newData.status,
          isOnline: newData.is_online
        }
      }));
    }

    // Émettre un événement pour toute mise à jour
    window.dispatchEvent(new CustomEvent('userUpdated', {
      detail: { user: newData, changes: this.getChangedFields(oldData, newData) }
    }));
  }

  /**
   * Gérer l'ajout à une nouvelle discussion
   * @param {Object} participant - Données du participant
   */
  async handleNewDiscussion(participant) {
    try {
      // Récupérer les détails de la discussion
      const { data: discussion } = await supabase
        .from('discussions')
        .select(`
          *,
          discussion_participants(
            user:user_id(name, avatar_url)
          )
        `)
        .eq('id', participant.discussion_id)
        .single();

      if (discussion) {
        // Émettre un événement
        window.dispatchEvent(new CustomEvent('newDiscussion', {
          detail: { discussion, role: participant.role }
        }));

        // Créer une notification
        await notificationService.createNotification({
          user_id: this.currentUserId,
          type: 'discussion',
          title: 'Nouvelle discussion',
          body: `Vous avez été ajouté à "${discussion.name || 'une discussion'}"`,
          data: { discussion_id: discussion.id },
          action_url: `/chat/${discussion.id}`
        });
      }
    } catch (error) {
      console.error('❌ Erreur gestion nouvelle discussion:', error);
    }
  }

  /**
   * Diffuser un message à tous les utilisateurs en ligne
   * @param {string} event - Nom de l'événement
   * @param {Object} payload - Données à diffuser
   */
  async broadcast(event, payload) {
    try {
      const channel = supabase.channel('broadcast');
      
      await channel
        .send({
          type: 'broadcast',
          event,
          payload: {
            ...payload,
            sender_id: this.currentUserId,
            sent_at: new Date().toISOString()
          }
        });

      console.log('📡 Message diffusé:', event);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur diffusion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gérer la reconnexion après une perte de connexion
   */
  async handleReconnection() {
    try {
      console.log('🔄 Tentative de reconnexion...');

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
        this.showConnectionError();
        return;
      }

      this.reconnectAttempts++;

      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));

      // Réinitialiser
      await this.cleanup();
      await this.initialize(this.currentUserId);

      this.reconnectAttempts = 0;
      console.log('✅ Reconnexion réussie');

    } catch (error) {
      console.error('❌ Erreur reconnexion:', error);
      setTimeout(() => this.handleReconnection(), this.reconnectDelay * 2);
    }
  }

  /**
   * Afficher une mise à jour système
   * @param {Object} payload - Données de la mise à jour
   */
  showSystemUpdate(payload) {
    window.dispatchEvent(new CustomEvent('systemUpdate', {
      detail: payload
    }));
  }

  /**
   * Afficher un message diffusé
   * @param {Object} payload - Données du message
   */
  showBroadcastMessage(payload) {
    window.dispatchEvent(new CustomEvent('broadcastMessage', {
      detail: payload
    }));
  }

  /**
   * Afficher une erreur de connexion
   */
  showConnectionError() {
    window.dispatchEvent(new CustomEvent('connectionError', {
      detail: {
        message: 'Connexion perdue. Veuillez rafraîchir la page.',
        type: 'error'
      }
    }));
  }

  /**
   * Obtenir les champs modifiés entre deux objets
   * @param {Object} oldObj - Ancien objet
   * @param {Object} newObj - Nouvel objet
   */
  getChangedFields(oldObj, newObj) {
    const changes = {};
    
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        changes[key] = {
          old: oldObj[key],
          new: newObj[key]
        };
      }
    }
    
    return changes;
  }

  /**
   * Vérifier l'état de la connexion
   */
  checkConnectionStatus() {
    const channels = supabase.getChannels();
    const connected = channels.some(channel => 
      channel.state === 'joined' || channel.state === 'joining'
    );
    
    return {
      connected,
      channelCount: channels.length,
      channels: channels.map(ch => ({
        topic: ch.topic,
        state: ch.state
      }))
    };
  }

  /**
   * Nettoyer toutes les ressources
   */
  async cleanup() {
    try {
      console.log('🧹 Nettoyage service temps réel...');

      // Mettre l'utilisateur hors ligne
      if (this.currentUserId) {
        await userService.setUserOffline(this.currentUserId);
      }

      // Retirer de la présence
      if (this.presenceChannel) {
        await this.presenceChannel.untrack();
        supabase.removeChannel(this.presenceChannel);
        this.presenceChannel = null;
      }

      // Nettoyer tous les abonnements
      for (const [key, subscription] of this.subscriptions) {
        await supabase.removeChannel(subscription);
      }
      this.subscriptions.clear();

      // Nettoyer les services dépendants
      chatService.cleanup();
      notificationService.unsubscribeFromNotifications();

      // Réinitialiser l'état
      this.isInitialized = false;
      this.currentUserId = null;

      console.log('✅ Service temps réel nettoyé');

    } catch (error) {
      console.error('❌ Erreur nettoyage temps réel:', error);
    }
  }
}

// Instance singleton
const realtimeService = new RealtimeService();

// Gérer la reconnexion automatique
supabase.channel('connection-check')
  .on('system', { event: '*' }, (payload) => {
    if (payload.event === 'disconnect') {
      console.log('⚠️ Connexion perdue');
      realtimeService.handleReconnection();
    }
  })
  .subscribe();

export default realtimeService;
