import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des notifications
 * Compatible avec le schéma database_schema_updated.sql
 */
class NotificationService {
  constructor() {
    this.notificationSubscription = null;
    this.permissionGranted = false;
    this.soundEnabled = true;
    this.notificationSound = new Audio('/notification.mp3');
  }

  /**
   * Initialiser le service de notifications
   * @param {string} userId - ID de l'utilisateur
   */
  async initialize(userId) {
    try {
      // Demander la permission pour les notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
        console.log('📢 Permission notifications:', permission);
      }

      // Charger les préférences utilisateur
      const { data: user } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();

      if (user?.preferences?.notifications) {
        this.soundEnabled = user.preferences.notifications.sound ?? true;
      }

      // S'abonner aux notifications en temps réel
      this.subscribeToNotifications(userId);

      return { success: true, permissionGranted: this.permissionGranted };

    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une nouvelle notification
   * @param {Object} notificationData - Données de la notification
   */
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          action_url: notificationData.action_url || null,
          priority: notificationData.priority || 'normal',
          expires_at: notificationData.expires_at || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création notification:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notification créée:', data.id);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans createNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer des notifications pour plusieurs utilisateurs
   * @param {Array} userIds - IDs des utilisateurs
   * @param {Object} notificationData - Données de la notification
   */
  async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        action_url: notificationData.action_url || null,
        priority: notificationData.priority || 'normal'
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('❌ Erreur création notifications bulk:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notifications créées:', data.length);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans createBulkNotifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} filters - Filtres optionnels
   */
  async getNotifications(userId, filters = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Filtrer par statut de lecture
      if (filters.unreadOnly) {
        query = query.eq('is_read', false);
      }

      // Filtrer par type
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      // Filtrer par priorité
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      // Exclure les notifications expirées
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      // Limiter le nombre de résultats
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur récupération notifications:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('❌ Erreur dans getNotifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {string} notificationId - ID de la notification
   * @param {string} userId - ID de l'utilisateur
   */
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId) // Sécurité
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur marquage lecture:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans markAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * @param {string} userId - ID de l'utilisateur
   */
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Erreur marquage toutes lues:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Toutes les notifications marquées comme lues');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans markAllAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer une notification
   * @param {string} notificationId - ID de la notification
   * @param {string} userId - ID de l'utilisateur
   */
  async deleteNotification(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId); // Sécurité

      if (error) {
        console.error('❌ Erreur suppression notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans deleteNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir le nombre de notifications non lues
   * @param {string} userId - ID de l'utilisateur
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (error) {
        console.error('❌ Erreur comptage non lues:', error);
        return { success: false, error: error.message };
      }

      return { success: true, count: count || 0 };

    } catch (error) {
      console.error('❌ Erreur dans getUnreadCount:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux notifications en temps réel
   * @param {string} userId - ID de l'utilisateur
   */
  subscribeToNotifications(userId) {
    try {
      console.log('🔄 Abonnement notifications temps réel');

      // Nettoyer l'abonnement existant
      this.unsubscribeFromNotifications();

      this.notificationSubscription = supabase
        .channel(`notifications:${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('🔔 Nouvelle notification:', payload.new);
          this.handleNewNotification(payload.new);
        })
        .subscribe();

      console.log('✅ Abonnement notifications activé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur abonnement notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Se désabonner des notifications
   */
  unsubscribeFromNotifications() {
    if (this.notificationSubscription) {
      supabase.removeChannel(this.notificationSubscription);
      this.notificationSubscription = null;
      console.log('🔌 Désabonnement notifications');
    }
  }

  /**
   * Gérer une nouvelle notification
   * @param {Object} notification - Notification reçue
   */
  async handleNewNotification(notification) {
    try {
      // Jouer le son si activé
      if (this.soundEnabled && notification.priority !== 'low') {
        this.playNotificationSound();
      }

      // Afficher la notification système si autorisé
      if (this.permissionGranted && !notification.is_push_sent) {
        await this.showSystemNotification(notification);
      }

      // Émettre un événement pour l'UI
      window.dispatchEvent(new CustomEvent('newNotification', {
        detail: notification
      }));

    } catch (error) {
      console.error('❌ Erreur gestion notification:', error);
    }
  }

  /**
   * Afficher une notification système
   * @param {Object} notification - Données de la notification
   */
  async showSystemNotification(notification) {
    try {
      if (!('Notification' in window) || !this.permissionGranted) {
        return;
      }

      const options = {
        body: notification.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        data: notification.data,
        actions: []
      };

      // Ajouter des actions selon le type
      switch (notification.type) {
        case 'message':
          options.actions = [
            { action: 'reply', title: 'Répondre' },
            { action: 'view', title: 'Voir' }
          ];
          break;
        case 'call':
          options.actions = [
            { action: 'answer', title: 'Répondre' },
            { action: 'decline', title: 'Décliner' }
          ];
          break;
      }

      const systemNotif = new Notification(notification.title, options);

      // Gérer le clic sur la notification
      systemNotif.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        systemNotif.close();
      };

      // Marquer comme envoyée
      await supabase
        .from('notifications')
        .update({ is_push_sent: true })
        .eq('id', notification.id);

    } catch (error) {
      console.error('❌ Erreur affichage notification système:', error);
    }
  }

  /**
   * Jouer le son de notification
   */
  playNotificationSound() {
    try {
      this.notificationSound.play().catch(err => {
        console.log('⚠️ Impossible de jouer le son:', err);
      });
    } catch (error) {
      console.error('❌ Erreur lecture son:', error);
    }
  }

  /**
   * Créer des notifications pour des événements spécifiques
   */
  async notifyNewMessage(senderId, discussionId, messageContent) {
    try {
      // Récupérer les participants de la discussion
      const { data: participants } = await supabase
        .from('discussion_participants')
        .select('user_id')
        .eq('discussion_id', discussionId)
        .eq('is_active', true)
        .neq('user_id', senderId);

      if (!participants || participants.length === 0) return;

      // Récupérer les infos de l'expéditeur et de la discussion
      const { data: sender } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', senderId)
        .single();

      const { data: discussion } = await supabase
        .from('discussions')
        .select('name, type')
        .eq('id', discussionId)
        .single();

      // Créer les notifications
      const userIds = participants.map(p => p.user_id);
      const notificationData = {
        type: 'message',
        title: discussion?.type === 'group' ? `${sender?.name} dans ${discussion?.name}` : sender?.name || 'Nouveau message',
        body: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
        data: {
          discussion_id: discussionId,
          sender_id: senderId,
          sender_name: sender?.name,
          sender_avatar: sender?.avatar_url
        },
        action_url: `/chat/${discussionId}`,
        priority: 'normal'
      };

      await this.createBulkNotifications(userIds, notificationData);

    } catch (error) {
      console.error('❌ Erreur notification nouveau message:', error);
    }
  }

  async notifyIncomingCall(callId, initiatorId, participantIds) {
    try {
      const { data: initiator } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', initiatorId)
        .single();

      const notificationData = {
        type: 'call',
        title: 'Appel entrant',
        body: `${initiator?.name || 'Quelqu\'un'} vous appelle`,
        data: {
          call_id: callId,
          initiator_id: initiatorId,
          initiator_name: initiator?.name,
          initiator_avatar: initiator?.avatar_url
        },
        action_url: `/call/${callId}`,
        priority: 'urgent'
      };

      await this.createBulkNotifications(participantIds, notificationData);

    } catch (error) {
      console.error('❌ Erreur notification appel entrant:', error);
    }
  }

  async notifyMention(messageId, mentionedUserIds, senderId, discussionId) {
    try {
      const { data: sender } = await supabase
        .from('users')
        .select('name')
        .eq('id', senderId)
        .single();

      const notificationData = {
        type: 'mention',
        title: 'Vous avez été mentionné',
        body: `${sender?.name || 'Quelqu\'un'} vous a mentionné dans une discussion`,
        data: {
          message_id: messageId,
          discussion_id: discussionId,
          sender_id: senderId
        },
        action_url: `/chat/${discussionId}#${messageId}`,
        priority: 'high'
      };

      await this.createBulkNotifications(mentionedUserIds, notificationData);

    } catch (error) {
      console.error('❌ Erreur notification mention:', error);
    }
  }

  /**
   * Mettre à jour les préférences de notification
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} preferences - Nouvelles préférences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          preferences: supabase.raw(`preferences || jsonb_build_object('notifications', ?::jsonb)`, [
            JSON.stringify(preferences)
          ])
        })
        .eq('id', userId)
        .select('preferences')
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour préférences:', error);
        return { success: false, error: error.message };
      }

      // Mettre à jour les préférences locales
      if (preferences.sound !== undefined) {
        this.soundEnabled = preferences.sound;
      }

      return { success: true, data: data.preferences };

    } catch (error) {
      console.error('❌ Erreur dans updateNotificationPreferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Nettoyer les notifications expirées
   */
  async cleanupExpiredNotifications() {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Erreur nettoyage notifications expirées:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notifications expirées nettoyées');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans cleanupExpiredNotifications:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;
