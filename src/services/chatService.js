import { supabase } from '../lib/supabase';

/**
 * Service Chat Elite - Gestion complète de la messagerie
 * Compatible avec le schéma database_schema_updated.sql
 */
class ChatService {
  constructor() {
    this.realtimeSubscriptions = new Map();
    this.messageCache = new Map();
    this.typingTimeouts = new Map();
  }

  /**
   * Charger les messages d'une discussion avec pagination
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur courant
   * @param {number} limit - Limite de messages
   * @param {string} before - Curseur pour pagination (ID du message)
   */
  async loadMessages(discussionId, userId, limit = 50, before = null) {
    try {
      console.log('🔄 Chargement messages discussion:', discussionId);

      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          message_type,
          status,
          created_at,
          updated_at,
          is_edited,
          is_deleted,
          is_pinned,
          is_important,
          media_url,
          media_type,
          media_size,
          media_name,
          thumbnail_url,
          reply_to_id,
          mentions,
          metadata,
          location,
          sender:sender_id(
            id,
            name,
            username,
            avatar_url,
            status,
            is_online
          ),
          reply_to:reply_to_id(
            id,
            content,
            sender_id,
            created_at,
            sender:sender_id(name, avatar_url)
          ),
          message_reactions(
            id,
            emoji,
            user_id,
            created_at,
            user:user_id(name, avatar_url)
          ),
          message_read_status(
            user_id,
            read_at
          )
        `)
        .eq('discussion_id', discussionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Pagination avec curseur
      if (before) {
        const { data: beforeMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', before)
          .single();

        if (beforeMessage) {
          query = query.lt('created_at', beforeMessage.created_at);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur chargement messages:', error);
        return { success: false, error: error.message };
      }

      // Transformer les données pour le frontend
      const formattedMessages = this.formatMessagesForUI(data || [], userId);

      // Mettre en cache
      const cacheKey = `${discussionId}-${limit}-${before || 'latest'}`;
      this.messageCache.set(cacheKey, formattedMessages);

      console.log('✅ Messages chargés:', formattedMessages.length);
      return { 
        success: true, 
        data: formattedMessages.reverse(), // Ordre chronologique pour l'affichage
        hasMore: data?.length === limit
      };

    } catch (error) {
      console.error('❌ Erreur dans loadMessages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer un nouveau message
   * @param {Object} messageData - Données du message
   */
  async sendMessage(messageData) {
    try {
      console.log('🔄 Envoi message:', messageData.content?.substring(0, 50));

      // Valider les données obligatoires
      if (!messageData.discussion_id || !messageData.sender_id || !messageData.content) {
        throw new Error('Données de message incomplètes');
      }

      // Préparer les données pour l'insertion
      const insertData = {
        discussion_id: messageData.discussion_id,
        sender_id: messageData.sender_id,
        content: messageData.content.trim(),
        message_type: messageData.message_type || 'text',
        status: 'sent',
        
        // Médias
        media_url: messageData.media_url || null,
        media_type: messageData.media_type || null,
        media_size: messageData.media_size || null,
        media_name: messageData.media_name || null,
        thumbnail_url: messageData.thumbnail_url || null,
        
        // Réponses et mentions
        reply_to_id: messageData.reply_to_id || null,
        mentions: messageData.mentions || [],
        
        // Métadonnées
        metadata: messageData.metadata || {},
        location: messageData.location || null
      };

      // Insérer le message
      const { data, error } = await supabase
        .from('messages')
        .insert(insertData)
        .select(`
          id,
          content,
          message_type,
          status,
          created_at,
          updated_at,
          is_edited,
          media_url,
          media_type,
          reply_to_id,
          mentions,
          metadata,
          location,
          sender:sender_id(
            id,
            name,
            username,
            avatar_url,
            status,
            is_online
          ),
          reply_to:reply_to_id(
            id,
            content,
            sender_id,
            sender:sender_id(name, avatar_url)
          )
        `)
        .single();

      if (error) {
        console.error('❌ Erreur envoi message:', error);
        return { success: false, error: error.message };
      }

      // Formater pour l'UI
      const formattedMessage = this.formatMessageForUI(data, messageData.sender_id);

      // Invalider le cache
      this.invalidateMessageCache(messageData.discussion_id);

      console.log('✅ Message envoyé:', data.id);
      return { success: true, data: formattedMessage };

    } catch (error) {
      console.error('❌ Erreur dans sendMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Modifier un message existant
   * @param {string} messageId - ID du message
   * @param {string} newContent - Nouveau contenu
   * @param {string} userId - ID de l'utilisateur
   */
  async editMessage(messageId, newContent, userId) {
    try {
      console.log('🔄 Modification message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId) // Sécurité
        .select(`
          id,
          content,
          is_edited,
          updated_at,
          discussion_id
        `)
        .single();

      if (error) {
        console.error('❌ Erreur modification message:', error);
        return { success: false, error: error.message };
      }

      // Invalider le cache
      this.invalidateMessageCache(data.discussion_id);

      console.log('✅ Message modifié:', messageId);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans editMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un message
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   */
  async deleteMessage(messageId, userId) {
    try {
      console.log('🔄 Suppression message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId) // Sécurité
        .select('id, discussion_id')
        .single();

      if (error) {
        console.error('❌ Erreur suppression message:', error);
        return { success: false, error: error.message };
      }

      // Invalider le cache
      this.invalidateMessageCache(data.discussion_id);

      console.log('✅ Message supprimé:', messageId);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans deleteMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajouter une réaction à un message
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   * @param {string} emoji - Emoji de la réaction
   */
  async addReaction(messageId, userId, emoji) {
    try {
      console.log('🔄 Ajout réaction:', emoji, 'sur message:', messageId);

      // Vérifier si la réaction existe déjà
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Supprimer la réaction existante
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);

        console.log('✅ Réaction supprimée');
        return { success: true, action: 'removed' };
      } else {
        // Ajouter la nouvelle réaction
        const { data, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji
          })
          .select(`
            id,
            emoji,
            created_at,
            user:user_id(name, avatar_url)
          `)
          .single();

        if (error) {
          console.error('❌ Erreur ajout réaction:', error);
          return { success: false, error: error.message };
        }

        console.log('✅ Réaction ajoutée');
        return { success: true, action: 'added', data };
      }

    } catch (error) {
      console.error('❌ Erreur dans addReaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer les messages comme lus
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   * @param {Array} messageIds - IDs des messages (optionnel)
   */
  async markMessagesAsRead(discussionId, userId, messageIds = null) {
    try {
      console.log('🔄 Marquage messages comme lus:', discussionId);

      if (messageIds && messageIds.length > 0) {
        // Marquer des messages spécifiques
        const inserts = messageIds.map(messageId => ({
          message_id: messageId,
          user_id: userId
        }));

        const { error } = await supabase
          .from('message_read_status')
          .upsert(inserts, { onConflict: 'message_id,user_id' });

        if (error) {
          console.error('❌ Erreur marquage lecture:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Utiliser la fonction SQL pour tous les messages non lus
        const { error } = await supabase
          .rpc('mark_messages_as_read', {
            discussion_uuid: discussionId,
            user_uuid: userId
          });

        if (error) {
          console.error('❌ Erreur marquage lecture RPC:', error);
          return { success: false, error: error.message };
        }
      }

      console.log('✅ Messages marqués comme lus');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans markMessagesAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gérer les indicateurs de frappe
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} isTyping - État de frappe
   */
  async updateTypingIndicator(discussionId, userId, isTyping) {
    try {
      if (isTyping) {
        // Ajouter l'indicateur
        await supabase
          .from('typing_indicators')
          .upsert({
            discussion_id: discussionId,
            user_id: userId,
            started_at: new Date().toISOString()
          });

        // Auto-suppression après 10 secondes
        const timeoutKey = `${discussionId}-${userId}`;
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey));
        }

        const timeout = setTimeout(() => {
          this.updateTypingIndicator(discussionId, userId, false);
          this.typingTimeouts.delete(timeoutKey);
        }, 10000);

        this.typingTimeouts.set(timeoutKey, timeout);
      } else {
        // Supprimer l'indicateur
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', userId);

        const timeoutKey = `${discussionId}-${userId}`;
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey));
          this.typingTimeouts.delete(timeoutKey);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur indicateur frappe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux mises à jour en temps réel d'une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur courant
   * @param {Function} onNewMessage - Callback pour nouveaux messages
   * @param {Function} onMessageUpdate - Callback pour mises à jour
   * @param {Function} onTypingUpdate - Callback pour indicateurs de frappe
   */
  subscribeToDiscussion(discussionId, userId, callbacks = {}) {
    try {
      console.log('🔄 Abonnement temps réel discussion:', discussionId);

      // Nettoyer l'abonnement existant
      this.unsubscribeFromDiscussion(discussionId);

      const subscriptions = [];

      // 1. Nouveaux messages
      if (callbacks.onNewMessage) {
        const messagesSub = supabase
          .channel(`messages:${discussionId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `discussion_id=eq.${discussionId}`
          }, async (payload) => {
            console.log('📨 Nouveau message temps réel:', payload.new.id);
            
            // Charger le message complet avec relations
            const { data } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                message_type,
                status,
                created_at,
                sender:sender_id(id, name, avatar_url, status)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              const formattedMessage = this.formatMessageForUI(data, userId);
              callbacks.onNewMessage(formattedMessage);
            }
          })
          .subscribe();

        subscriptions.push(messagesSub);
      }

      // 2. Mises à jour de messages
      if (callbacks.onMessageUpdate) {
        const updatesSub = supabase
          .channel(`message_updates:${discussionId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `discussion_id=eq.${discussionId}`
          }, (payload) => {
            console.log('📝 Message mis à jour:', payload.new.id);
            callbacks.onMessageUpdate(payload.new);
          })
          .subscribe();

        subscriptions.push(updatesSub);
      }

      // 3. Indicateurs de frappe
      if (callbacks.onTypingUpdate) {
        const typingSub = supabase
          .channel(`typing:${discussionId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'typing_indicators',
            filter: `discussion_id=eq.${discussionId}`
          }, async (payload) => {
            console.log('⌨️ Indicateur frappe mis à jour');
            
            // Récupérer tous les indicateurs actifs
            const { data } = await supabase
              .from('typing_indicators')
              .select(`
                user_id,
                started_at,
                user:user_id(name, avatar_url)
              `)
              .eq('discussion_id', discussionId)
              .gte('started_at', new Date(Date.now() - 10000).toISOString()); // 10 secondes

            callbacks.onTypingUpdate(data || []);
          })
          .subscribe();

        subscriptions.push(typingSub);
      }

      // 4. Réactions
      if (callbacks.onReactionUpdate) {
        const reactionsSub = supabase
          .channel(`reactions:${discussionId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'message_reactions'
          }, async (payload) => {
            console.log('😊 Réaction mise à jour');
            callbacks.onReactionUpdate(payload);
          })
          .subscribe();

        subscriptions.push(reactionsSub);
      }

      this.realtimeSubscriptions.set(discussionId, subscriptions);

      console.log('✅ Abonnement temps réel activé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur abonnement temps réel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Se désabonner des mises à jour d'une discussion
   * @param {string} discussionId - ID de la discussion
   */
  unsubscribeFromDiscussion(discussionId) {
    const subscriptions = this.realtimeSubscriptions.get(discussionId);
    if (subscriptions) {
      subscriptions.forEach(sub => {
        supabase.removeChannel(sub);
      });
      this.realtimeSubscriptions.delete(discussionId);
      console.log('🔌 Désabonnement temps réel:', discussionId);
    }
  }

  /**
   * Formater un message pour l'interface utilisateur
   * @param {Object} message - Message brut de la DB
   * @param {string} currentUserId - ID utilisateur courant
   */
  formatMessageForUI(message, currentUserId) {
    const isOwn = message.sender?.id === currentUserId;
    
    return {
      id: message.id,
      content: message.content,
      text: message.content, // Alias compatibilité
      type: message.message_type || 'text',
      status: message.status || 'sent',
      
      // Expéditeur
      sender: isOwn ? 'me' : message.sender?.name || 'Utilisateur',
      senderId: message.sender?.id,
      senderName: message.sender?.name,
      avatar: message.sender?.avatar_url,
      isOwn,
      
      // Timestamps
      timestamp: message.created_at,
      time: new Date(message.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      created_at: message.created_at,
      updated_at: message.updated_at,
      
      // États
      is_edited: message.is_edited || false,
      is_pinned: message.is_pinned || false,
      is_important: message.is_important || false,
      
      // Médias
      media_url: message.media_url,
      media_type: message.media_type,
      media_size: message.media_size,
      media_name: message.media_name,
      thumbnail_url: message.thumbnail_url,
      
      // Réponses
      reply_to_id: message.reply_to_id,
      reply_to: message.reply_to ? {
        id: message.reply_to.id,
        content: message.reply_to.content,
        sender: message.reply_to.sender?.name || 'Utilisateur',
        avatar: message.reply_to.sender?.avatar_url
      } : null,
      
      // Mentions et métadonnées
      mentions: message.mentions || [],
      metadata: message.metadata || {},
      location: message.location,
      
      // Réactions (formatées)
      reactions: this.formatReactions(message.message_reactions || []),
      
      // Statut de lecture
      readBy: message.message_read_status || [],
      isRead: message.message_read_status?.some(r => r.user_id === currentUserId) || false
    };
  }

  /**
   * Formater plusieurs messages
   */
  formatMessagesForUI(messages, currentUserId) {
    return messages.map(msg => this.formatMessageForUI(msg, currentUserId));
  }

  /**
   * Formater les réactions
   */
  formatReactions(reactions) {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          userIds: []
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push({
        id: reaction.user_id,
        name: reaction.user?.name || 'Utilisateur',
        avatar: reaction.user?.avatar_url
      });
      acc[reaction.emoji].userIds.push(reaction.user_id);
      return acc;
    }, {});

    return Object.values(grouped);
  }

  /**
   * Invalider le cache des messages
   */
  invalidateMessageCache(discussionId) {
    const keysToDelete = [];
    for (const key of this.messageCache.keys()) {
      if (key.startsWith(discussionId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.messageCache.delete(key));
  }

  /**
   * Nettoyer toutes les ressources
   */
  cleanup() {
    // Nettoyer les abonnements temps réel
    for (const [discussionId, subscriptions] of this.realtimeSubscriptions) {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    }
    this.realtimeSubscriptions.clear();

    // Nettoyer les timeouts de frappe
    for (const timeout of this.typingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.typingTimeouts.clear();

    // Nettoyer le cache
    this.messageCache.clear();

    console.log('🧹 Chat service nettoyé');
  }
}

// Instance singleton
const chatService = new ChatService();

export default chatService;
