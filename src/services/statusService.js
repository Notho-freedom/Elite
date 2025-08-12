import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des statuts/stories
 * Compatible avec le schéma database_schema_updated.sql
 */
class StatusService {
  constructor() {
    this.statusCache = new Map();
    this.statusSubscription = null;
  }

  /**
   * Créer un nouveau statut
   * @param {Object} statusData - Données du statut
   * @param {string} userId - ID de l'utilisateur
   */
  async createStatus(statusData, userId) {
    try {
      console.log('🔄 Création statut:', statusData.type);

      // Valider les données
      if (!statusData.content && !statusData.media_url) {
        return { success: false, error: 'Un contenu ou média est requis' };
      }

      // Calculer la date d'expiration
      const duration = statusData.duration || 86400; // 24h par défaut
      const expiresAt = new Date(Date.now() + duration * 1000);

      // Préparer les données
      const insertData = {
        user_id: userId,
        content: statusData.content || null,
        media_url: statusData.media_url || null,
        thumbnail_url: statusData.thumbnail_url || null,
        type: statusData.type || 'text',
        background_color: statusData.background_color || null,
        font_style: statusData.font_style || null,
        duration,
        visibility: statusData.visibility || 'contacts',
        allowed_viewers: statusData.allowed_viewers || [],
        expires_at: expiresAt.toISOString()
      };

      // Insérer le statut
      const { data, error } = await supabase
        .from('statuses')
        .insert(insertData)
        .select(`
          *,
          user:user_id(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('❌ Erreur création statut:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Statut créé:', data.id);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans createStatus:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les statuts actifs des contacts
   * @param {string} userId - ID de l'utilisateur courant
   */
  async getActiveStatuses(userId) {
    try {
      console.log('🔄 Récupération statuts actifs');

      // Récupérer d'abord les contacts de l'utilisateur
      const { data: contacts } = await supabase
        .from('discussion_participants')
        .select('discussion_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      const discussionIds = contacts?.map(c => c.discussion_id) || [];

      // Récupérer les autres participants de ces discussions
      const { data: participants } = await supabase
        .from('discussion_participants')
        .select('user_id')
        .in('discussion_id', discussionIds)
        .neq('user_id', userId)
        .eq('is_active', true);

      const contactIds = [...new Set(participants?.map(p => p.user_id) || [])];

      // Récupérer les statuts actifs
      let query = supabase
        .from('statuses')
        .select(`
          *,
          user:user_id(
            id,
            name,
            username,
            avatar_url,
            status,
            is_online
          ),
          status_views!left(
            viewer_id,
            viewed_at
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      // Filtrer selon la visibilité
      query = query.or(`visibility.eq.public,user_id.eq.${userId}`);
      
      if (contactIds.length > 0) {
        query = query.or(`user_id.in.(${contactIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur récupération statuts:', error);
        return { success: false, error: error.message };
      }

      // Grouper par utilisateur et formater
      const groupedStatuses = this.groupStatusesByUser(data || [], userId);

      console.log('✅ Statuts récupérés:', Object.keys(groupedStatuses).length, 'utilisateurs');
      return { success: true, data: groupedStatuses };

    } catch (error) {
      console.error('❌ Erreur dans getActiveStatuses:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les statuts d'un utilisateur spécifique
   * @param {string} targetUserId - ID de l'utilisateur cible
   * @param {string} viewerId - ID de l'utilisateur qui regarde
   */
  async getUserStatuses(targetUserId, viewerId) {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          *,
          user:user_id(
            id,
            name,
            username,
            avatar_url
          ),
          status_views!left(
            viewer_id,
            viewed_at
          )
        `)
        .eq('user_id', targetUserId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération statuts utilisateur:', error);
        return { success: false, error: error.message };
      }

      // Filtrer selon la visibilité et les permissions
      const filteredStatuses = data?.filter(status => {
        if (status.user_id === viewerId) return true;
        if (status.visibility === 'public') return true;
        if (status.visibility === 'contacts') {
          // Vérifier si viewerId est un contact
          // Cette logique devrait être améliorée avec une vraie vérification
          return true;
        }
        if (status.allowed_viewers.includes(viewerId)) return true;
        return false;
      }) || [];

      return { success: true, data: filteredStatuses };

    } catch (error) {
      console.error('❌ Erreur dans getUserStatuses:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marquer un statut comme vu
   * @param {string} statusId - ID du statut
   * @param {string} viewerId - ID du spectateur
   */
  async markStatusAsViewed(statusId, viewerId) {
    try {
      // Vérifier si déjà vu
      const { data: existingView } = await supabase
        .from('status_views')
        .select('id')
        .eq('status_id', statusId)
        .eq('viewer_id', viewerId)
        .single();

      if (existingView) {
        return { success: true, alreadyViewed: true };
      }

      // Ajouter la vue
      const { data, error } = await supabase
        .from('status_views')
        .insert({
          status_id: statusId,
          viewer_id: viewerId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur marquage vue:', error);
        return { success: false, error: error.message };
      }

      // Incrémenter le compteur de vues
      await supabase
        .from('statuses')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', statusId);

      console.log('✅ Statut marqué comme vu');
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans markStatusAsViewed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un statut
   * @param {string} statusId - ID du statut
   * @param {string} userId - ID de l'utilisateur
   */
  async deleteStatus(statusId, userId) {
    try {
      console.log('🔄 Suppression statut:', statusId);

      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', statusId)
        .eq('user_id', userId); // Sécurité

      if (error) {
        console.error('❌ Erreur suppression statut:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Statut supprimé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans deleteStatus:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les spectateurs d'un statut
   * @param {string} statusId - ID du statut
   * @param {string} ownerId - ID du propriétaire du statut
   */
  async getStatusViewers(statusId, ownerId) {
    try {
      // Vérifier que l'utilisateur est propriétaire
      const { data: status } = await supabase
        .from('statuses')
        .select('user_id')
        .eq('id', statusId)
        .single();

      if (!status || status.user_id !== ownerId) {
        return { success: false, error: 'Non autorisé' };
      }

      // Récupérer les vues
      const { data, error } = await supabase
        .from('status_views')
        .select(`
          *,
          viewer:viewer_id(
            id,
            name,
            username,
            avatar_url,
            status,
            is_online
          )
        `)
        .eq('status_id', statusId)
        .order('viewed_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération spectateurs:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('❌ Erreur dans getStatusViewers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour la visibilité d'un statut
   * @param {string} statusId - ID du statut
   * @param {string} userId - ID de l'utilisateur
   * @param {string} visibility - Nouvelle visibilité
   * @param {Array} allowedViewers - Spectateurs autorisés (optionnel)
   */
  async updateStatusVisibility(statusId, userId, visibility, allowedViewers = []) {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .update({
          visibility,
          allowed_viewers: allowedViewers
        })
        .eq('id', statusId)
        .eq('user_id', userId) // Sécurité
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour visibilité:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans updateStatusVisibility:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Nettoyer les statuts expirés (appelé périodiquement)
   */
  async cleanupExpiredStatuses() {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Erreur nettoyage statuts expirés:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Statuts expirés nettoyés');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans cleanupExpiredStatuses:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux mises à jour de statuts en temps réel
   * @param {string} userId - ID de l'utilisateur
   * @param {Function} onNewStatus - Callback pour nouveaux statuts
   * @param {Function} onStatusExpired - Callback pour statuts expirés
   */
  subscribeToStatuses(userId, onNewStatus, onStatusExpired) {
    try {
      console.log('🔄 Abonnement temps réel statuts');

      // Nettoyer l'abonnement existant
      this.unsubscribeFromStatuses();

      this.statusSubscription = supabase
        .channel('statuses:realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'statuses'
        }, async (payload) => {
          console.log('📸 Nouveau statut détecté');
          
          // Récupérer les détails complets
          const { data } = await supabase
            .from('statuses')
            .select(`
              *,
              user:user_id(
                id,
                name,
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data && this.canViewStatus(data, userId)) {
            onNewStatus(data);
          }
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'statuses'
        }, (payload) => {
          console.log('🗑️ Statut supprimé:', payload.old.id);
          onStatusExpired(payload.old.id);
        })
        .subscribe();

      console.log('✅ Abonnement statuts activé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur abonnement statuts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Se désabonner des mises à jour de statuts
   */
  unsubscribeFromStatuses() {
    if (this.statusSubscription) {
      supabase.removeChannel(this.statusSubscription);
      this.statusSubscription = null;
      console.log('🔌 Désabonnement statuts');
    }
  }

  /**
   * Grouper les statuts par utilisateur
   * @param {Array} statuses - Liste des statuts
   * @param {string} currentUserId - ID utilisateur courant
   */
  groupStatusesByUser(statuses, currentUserId) {
    const grouped = {};

    statuses.forEach(status => {
      const userId = status.user_id;
      
      if (!grouped[userId]) {
        grouped[userId] = {
          user: status.user,
          statuses: [],
          hasUnviewed: false,
          lastStatusTime: status.created_at
        };
      }

      // Vérifier si le statut a été vu
      const isViewed = status.status_views?.some(view => view.viewer_id === currentUserId);
      
      grouped[userId].statuses.push({
        ...status,
        isViewed
      });

      if (!isViewed && userId !== currentUserId) {
        grouped[userId].hasUnviewed = true;
      }
    });

    // Trier les statuts par date dans chaque groupe
    Object.values(grouped).forEach(group => {
      group.statuses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    return grouped;
  }

  /**
   * Vérifier si un utilisateur peut voir un statut
   * @param {Object} status - Statut à vérifier
   * @param {string} userId - ID de l'utilisateur
   */
  canViewStatus(status, userId) {
    if (status.user_id === userId) return true;
    if (status.visibility === 'public') return true;
    if (status.allowed_viewers?.includes(userId)) return true;
    
    // Pour 'contacts', nécessite une vérification supplémentaire
    // Cette logique devrait être améliorée
    if (status.visibility === 'contacts') return true;
    
    return false;
  }

  /**
   * Générer une miniature pour une vidéo
   * @param {string} videoUrl - URL de la vidéo
   */
  async generateVideoThumbnail(videoUrl) {
    try {
      // Cette fonction devrait utiliser un service de génération de miniatures
      // Pour l'instant, retourner null
      console.log('⚠️ Génération de miniature non implémentée');
      return null;
    } catch (error) {
      console.error('❌ Erreur génération miniature:', error);
      return null;
    }
  }
}

// Instance singleton
const statusService = new StatusService();

export default statusService;
