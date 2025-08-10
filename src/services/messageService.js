import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des messages
 * Compatible avec le nouveau schéma database_schema_updated.sql
 */
class MessageService {

  /**
   * Récupérer les messages d'une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur courant
   * @param {number} limit - Limite de messages à récupérer
   * @param {number} offset - Décalage pour pagination
   */
  async getMessages(discussionId, userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(*),
          reply_to:reply_to_id(*),
          message_reactions(*),
          message_read_status(*)
        `)
        .eq('discussion_id', discussionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return { success: false, error: error.message };
      }

      // Transformer les données pour le frontend
      const formattedMessages = data?.map(message => ({
        id: message.id,
        discussion_id: message.discussion_id,
        sender_id: message.sender_id,
        content: message.content,
        text: message.content, // Alias pour compatibilité
        type: message.message_type || 'text',
        
        // Métadonnées médias
        media_url: message.media_url,
        media_type: message.media_type,
        media_size: message.media_size,
        media_name: message.media_name,
        thumbnail_url: message.thumbnail_url,
        
        // Réponses et mentions
        reply_to_id: message.reply_to_id,
        reply_to: message.reply_to,
        mentions: message.mentions || [],
        
        // Statuts (nouveau schéma)
        status: message.status || 'sent',
        is_edited: message.is_edited || false,
        is_deleted: message.is_deleted || false,
        is_pinned: message.is_pinned || false,
        is_important: message.is_important || false,
        
        // Réactions
        reactions: this.formatReactions(message.message_reactions || []),
        
        // Lecture
        isRead: message.message_read_status?.some(rs => rs.user_id === userId) || false,
        readBy: message.message_read_status || [],
        
        // Métadonnées et localisation
        metadata: message.metadata || {},
        location: message.location,
        
        // Timestamps
        created_at: message.created_at,
        updated_at: message.updated_at,
        deleted_at: message.deleted_at,
        timestamp: message.created_at, // Alias pour compatibilité
        
        // Informations expéditeur
        sender: message.sender?.name || 'Utilisateur',
        senderId: message.sender_id,
        avatar: message.sender?.avatar_url,
        
        // Formatage pour l'affichage
        time: new Date(message.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })) || [];

      return { success: true, data: formattedMessages.reverse() }; // Ordre chronologique
    } catch (error) {
      console.error('Erreur dans getMessages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer un nouveau message
   * @param {Object} messageData - Données du message
   */
  async sendMessage(messageData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          discussion_id: messageData.discussion_id,
          sender_id: messageData.sender_id,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          status: 'sent',
          
          // Données optionnelles
          media_url: messageData.media_url || null,
          media_type: messageData.media_type || null,
          media_size: messageData.media_size || null,
          media_name: messageData.media_name || null,
          thumbnail_url: messageData.thumbnail_url || null,
          reply_to_id: messageData.reply_to_id || null,
          mentions: messageData.mentions || [],
          metadata: messageData.metadata || {},
          location: messageData.location || null
        })
        .select(`
          *,
          sender:sender_id(*)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Message envoyé:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans sendMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Modifier un message
   * @param {string} messageId - ID du message
   * @param {string} content - Nouveau contenu
   * @param {string} userId - ID de l'utilisateur
   */
  async editMessage(messageId, content, userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId) // Sécurité : seul l'expéditeur peut modifier
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification du message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans editMessage:', error);
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
      const { data, error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId) // Sécurité : seul l'expéditeur peut supprimer
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la suppression du message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans deleteMessage:', error);
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
      const { data, error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: userId,
          emoji
        })
        .select();

      if (error) {
        console.error('Erreur lors de l\'ajout de réaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans addReaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer une réaction
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   * @param {string} emoji - Emoji de la réaction
   */
  async removeReaction(messageId, userId, emoji) {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) {
        console.error('Erreur lors de la suppression de réaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans removeReaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer un message comme épinglé
   * @param {string} messageId - ID du message
   * @param {boolean} pinned - État épinglé
   */
  async pinMessage(messageId, pinned = true) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_pinned: pinned })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'épinglage du message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans pinMessage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer un message comme important
   * @param {string} messageId - ID du message
   * @param {boolean} important - État important
   */
  async markAsImportant(messageId, important = true) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_important: important })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors du marquage comme important:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans markAsImportant:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer un message comme lu
   * @param {string} messageId - ID du message
   * @param {string} userId - ID de l'utilisateur
   */
  async markAsRead(messageId, userId) {
    try {
      const { data, error } = await supabase
        .from('message_read_status')
        .upsert({
          message_id: messageId,
          user_id: userId
        })
        .select();

      if (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans markAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Formater les réactions pour le frontend
   * @param {Array} reactions - Réactions de la base de données
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
      acc[reaction.emoji].userIds.push(reaction.user_id);
      return acc;
    }, {});

    return Object.values(grouped);
  }

  /**
   * Rechercher des messages dans une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} query - Terme de recherche
   * @param {string} userId - ID de l'utilisateur
   */
  async searchMessages(discussionId, query, userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(*)
        `)
        .eq('discussion_id', discussionId)
        .eq('is_deleted', false)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erreur lors de la recherche de messages:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erreur dans searchMessages:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const messageService = new MessageService();

export default messageService;