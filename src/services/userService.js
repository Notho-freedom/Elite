import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des utilisateurs en base de données
 * Compatible avec le nouveau schéma database_schema_updated.sql
 */
class UserService {
  
  /**
   * Créer ou mettre à jour un profil utilisateur en BD
   * @param {Object} user - Utilisateur authentifié de Supabase Auth
   * @param {Object} additionalData - Données supplémentaires du profil
   */
  async upsertUserProfile(user, additionalData = {}) {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur invalide');
      }

      const profileData = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || additionalData.name || user.email?.split('@')[0],
        email: user.email,
        username: user.user_metadata?.username || additionalData.username || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || additionalData.avatar_url || null,
        phone: user.phone || additionalData.phone || null,
        
        // Informations supplémentaires
        bio: additionalData.bio || null,
        location: additionalData.location || null,
        website: additionalData.website || null,
        
        // Statut et présence
        status: 'online', // 'online', 'offline', 'away', 'busy'
        is_online: true,
        last_seen: new Date().toISOString(),
        
        // Métadonnées utilisateur
        user_metadata: {
          ...user.user_metadata,
          ...additionalData
        },
        
        // Préférences par défaut (JSONB)
        preferences: {
          theme: 'system',
          language: 'fr',
          notifications: {
            sound: true,
            vibration: true,
            chat: true,
            calls: true
          },
          privacy: {
            last_seen: 'everyone',
            read_receipts: true,
            typing_indicators: true
          }
        }
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(profileData, {
          onConflict: 'id',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'upsert du profil:', error);
        throw error;
      }

      console.log('Profil utilisateur créé/mis à jour:', data);
      return { success: true, data };

    } catch (error) {
      console.error('Erreur dans upsertUserProfile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer le profil complet d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans getUserProfile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour le statut en ligne
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} isOnline - Statut en ligne
   * @param {string} status - Statut détaillé ('online', 'offline', 'away', 'busy')
   */
  async updateOnlineStatus(userId, isOnline = true, status = null) {
    try {
      const updateData = {
        is_online: isOnline,
        last_seen: new Date().toISOString()
      };

      // Ajouter le statut si fourni
      if (status) {
        updateData.status = status;
      } else {
        updateData.status = isOnline ? 'online' : 'offline';
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans updateOnlineStatus:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer tous les utilisateurs sauf l'utilisateur courant
   * @param {string} currentUserId - ID de l'utilisateur courant à exclure
   * @param {Object} filters - Filtres optionnels
   */
  async getUsersExceptCurrent(currentUserId, filters = {}) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId); // Exclure l'utilisateur courant

      // Appliquer les filtres
      if (filters.isOnline) {
        query = query.eq('is_online', true);
      }

      if (filters.isActive) {
        // Dans le nouveau schéma, on peut filtrer par statut
        query = query.neq('status', 'offline');
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Ordonner par dernière activité (nouveau schéma)
      query = query.order('last_seen', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erreur dans getUsersExceptCurrent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les discussions de l'utilisateur (nouveau schéma)
   * @param {string} currentUserId - ID de l'utilisateur courant
   */
  async getUserDiscussions(currentUserId) {
    try {
      // Utiliser la vue discussions_with_details pour récupérer toutes les infos
      const { data: discussions, error } = await supabase
        .from('discussions_with_details')
        .select('*')
        .eq('user_id', currentUserId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des discussions:', error);
        return { success: false, error: error.message };
      }

      // Transformer les données pour correspondre au format attendu par le frontend
      const formattedDiscussions = discussions.map(discussion => ({
        id: discussion.id,
        name: discussion.display_name || discussion.name || 'Discussion',
        avatar: discussion.display_avatar || discussion.avatar_url || 'https://via.placeholder.com/150',
        lastMessage: discussion.last_message_content || 'Aucun message',
        time: discussion.last_message_at || discussion.updated_at,
        unread: discussion.unread_count > 0,
        unread_count: discussion.unread_count || 0,
        isOnline: discussion.other_user_online || false,
        typing: discussion.is_typing || false,
        user_id: discussion.other_user_id, // Pour discussions privées
        discussion_id: discussion.id,
        conversation_id: discussion.id, // Alias pour compatibilité
        type: discussion.type || 'private',
        
        // Informations supplémentaires du nouveau schéma
        is_pinned: discussion.is_pinned || false,
        is_archived: discussion.is_archived || false,
        is_muted: discussion.participant_muted || false,
        participant_count: discussion.participant_count || 0,
        last_message_type: discussion.last_message_type || 'text',
        last_message_status: discussion.last_message_status || 'sent',
        last_sender_name: discussion.last_sender_name,
        typing_users: discussion.typing_users || []
      }));

      console.log('✅ Discussions formatées:', formattedDiscussions.length);
      return { success: true, data: formattedDiscussions };
    } catch (error) {
      console.error('Erreur dans getUserDiscussions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une nouvelle discussion entre deux utilisateurs (nouveau schéma)
   * @param {string} currentUserId - ID de l'utilisateur courant
   * @param {string} otherUserId - ID de l'autre utilisateur
   */
  async createConversation(currentUserId, otherUserId) {
    try {
      console.log('🔄 Création discussion entre', currentUserId, 'et', otherUserId);

      // Utiliser la fonction SQL pour créer ou récupérer une discussion privée
      const { data: discussionId, error } = await supabase
        .rpc('create_private_discussion', {
          user1_uuid: currentUserId,
          user2_uuid: otherUserId
        });

      if (error) {
        console.error('Erreur lors de la création de discussion:', error);
        return { success: false, error: error.message };
      }

      // Récupérer les détails de la discussion créée/existante
      const { data: discussion, error: fetchError } = await supabase
        .from('discussions')
        .select('*')
        .eq('id', discussionId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la discussion:', fetchError);
        return { success: false, error: fetchError.message };
      }

      console.log('✅ Discussion créée/récupérée:', discussion.id);
      return { 
        success: true, 
        data: discussion, 
        isNew: discussion.created_at === discussion.updated_at 
      };
    } catch (error) {
      console.error('Erreur dans createConversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer l'utilisateur comme hors ligne lors de la déconnexion
   * @param {string} userId - ID de l'utilisateur
   */
  async setUserOffline(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          status: 'offline',
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la mise hors ligne:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans setUserOffline:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer des messages comme lus
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   */
  async markMessagesAsRead(discussionId, userId) {
    try {
      const { data, error } = await supabase
        .rpc('mark_messages_as_read', {
          discussion_uuid: discussionId,
          user_uuid: userId
        });

      if (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur dans markMessagesAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour les indicateurs de frappe
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} isTyping - État de frappe
   */
  async updateTypingIndicator(discussionId, userId, isTyping = true) {
    try {
      if (isTyping) {
        // Ajouter/mettre à jour l'indicateur de frappe
        const { data, error } = await supabase
          .from('typing_indicators')
          .upsert({
            discussion_id: discussionId,
            user_id: userId,
            started_at: new Date().toISOString()
          });

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data };
      } else {
        // Supprimer l'indicateur de frappe
        const { data, error } = await supabase
          .from('typing_indicators')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', userId);

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data };
      }
    } catch (error) {
      console.error('Erreur dans updateTypingIndicator:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const userService = new UserService();

export default userService;