import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des utilisateurs en base de données
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
        email: user.email,
        full_name: user.user_metadata?.full_name || additionalData.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || additionalData.avatar_url || '',
        username: user.user_metadata?.username || additionalData.username || user.email?.split('@')[0],
        phone: user.phone || additionalData.phone || null,
        
        // Métadonnées utilisateur
        user_metadata: {
          ...user.user_metadata,
          ...additionalData
        },
        
        // Timestamps
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
        
        // Statut
        is_online: true,
        is_active: true,
        
        // Préférences par défaut
        preferences: {
          theme: 'system',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            chat: true,
            calls: true
          },
          privacy: {
            profile_visibility: 'public',
            last_seen: 'everyone',
            read_receipts: true
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
   */
  async updateOnlineStatus(userId, isOnline = true) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen_at: new Date().toISOString()
        })
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
        query = query.eq('is_active', true);
      }

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Ordonner par dernière connexion
      query = query.order('last_sign_in_at', { ascending: false });

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
   * Récupérer les discussions de l'utilisateur (conversations)
   * @param {string} currentUserId - ID de l'utilisateur courant
   */
  async getUserDiscussions(currentUserId) {
    try {
      // Récupérer les conversations où l'utilisateur participe
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants!inner(user_id, joined_at),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .eq('participants.user_id', currentUserId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        return { success: false, error: error.message };
      }

      // Transformer les données pour correspondre au format attendu
      const discussions = await Promise.all(
        conversations.map(async (conv) => {
          // Récupérer l'autre participant (excluant l'utilisateur courant)
          const otherParticipants = conv.participants.filter(p => p.user_id !== currentUserId);
          
          if (otherParticipants.length === 0) {
            return null; // Conversation vide ou erreur
          }

          const otherUserId = otherParticipants[0].user_id;
          
          // Récupérer les infos de l'autre utilisateur
          const { data: otherUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', otherUserId)
            .single();

          // Dernier message
          const lastMessage = conv.messages?.[0];
          
          // Compter les messages non lus
          const unreadCount = conv.messages?.filter(
            m => m.sender_id !== currentUserId && !m.is_read
          ).length || 0;

          return {
            id: conv.id,
            name: otherUser?.full_name || otherUser?.username || 'Utilisateur',
            avatar: otherUser?.avatar_url || 'https://via.placeholder.com/150',
            lastMessage: lastMessage?.content || 'Aucun message',
            time: lastMessage?.created_at || conv.created_at,
            unread: unreadCount > 0,
            unread_count: unreadCount,
            isOnline: otherUser?.is_online || false,
            typing: false,
            user_id: otherUserId,
            conversation_id: conv.id,
            type: 'private'
          };
        })
      );

      // Filtrer les discussions nulles
      const validDiscussions = discussions.filter(d => d !== null);

      return { success: true, data: validDiscussions };
    } catch (error) {
      console.error('Erreur dans getUserDiscussions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer une nouvelle conversation entre deux utilisateurs
   * @param {string} currentUserId - ID de l'utilisateur courant
   * @param {string} otherUserId - ID de l'autre utilisateur
   */
  async createConversation(currentUserId, otherUserId) {
    try {
      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select(`
          id,
          participants!inner(user_id)
        `)
        .eq('type', 'private')
        .eq('participants.user_id', currentUserId);

      // Filtrer pour trouver une conversation avec les deux utilisateurs
      const existing = existingConv?.find(conv => 
        conv.participants.some(p => p.user_id === otherUserId)
      );

      if (existing) {
        return { success: true, data: existing, isNew: false };
      }

      // Créer une nouvelle conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'private',
          name: null, // Pas de nom pour les conversations privées
          created_by: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) {
        throw convError;
      }

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('participants')
        .insert([
          {
            conversation_id: newConv.id,
            user_id: currentUserId,
            joined_at: new Date().toISOString(),
            role: 'admin'
          },
          {
            conversation_id: newConv.id,
            user_id: otherUserId,
            joined_at: new Date().toISOString(),
            role: 'member'
          }
        ]);

      if (participantsError) {
        throw participantsError;
      }

      return { success: true, data: newConv, isNew: true };
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
          is_online: false,
          last_seen_at: new Date().toISOString()
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
}

// Instance singleton
const userService = new UserService();

export default userService;
