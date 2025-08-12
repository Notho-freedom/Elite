import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des discussions
 * Compatible avec le schéma database_schema_updated.sql
 */
class DiscussionService {

  /**
   * Créer une nouvelle discussion
   * @param {Object} discussionData - Données de la discussion
   * @param {Array} participantIds - IDs des participants à ajouter
   * @param {string} creatorId - ID du créateur
   */
  async createDiscussion(discussionData, participantIds, creatorId) {
    try {
      console.log('🔄 Création discussion:', discussionData.name || 'Discussion privée');

      // Créer la discussion
      const { data: discussion, error: discussionError } = await supabase
        .from('discussions')
        .insert({
          name: discussionData.name || null,
          description: discussionData.description || null,
          avatar_url: discussionData.avatar_url || null,
          type: discussionData.type || 'private',
          is_public: discussionData.is_public || false,
          max_participants: discussionData.max_participants || 256,
          created_by: creatorId,
          metadata: discussionData.metadata || {}
        })
        .select()
        .single();

      if (discussionError) {
        console.error('❌ Erreur création discussion:', discussionError);
        return { success: false, error: discussionError.message };
      }

      // Ajouter les participants
      const participants = participantIds.map(userId => ({
        discussion_id: discussion.id,
        user_id: userId,
        role: userId === creatorId ? 'admin' : 'member',
        is_active: true
      }));

      const { error: participantsError } = await supabase
        .from('discussion_participants')
        .insert(participants);

      if (participantsError) {
        console.error('❌ Erreur ajout participants:', participantsError);
        // Rollback - supprimer la discussion créée
        await supabase.from('discussions').delete().eq('id', discussion.id);
        return { success: false, error: participantsError.message };
      }

      // Générer un lien d'invitation si public
      if (discussionData.is_public) {
        const inviteLink = await this.generateInviteLink(discussion.id);
        if (inviteLink.success) {
          discussion.invite_link = inviteLink.data;
        }
      }

      console.log('✅ Discussion créée:', discussion.id);
      return { success: true, data: discussion };

    } catch (error) {
      console.error('❌ Erreur dans createDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les détails d'une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur courant
   */
  async getDiscussion(discussionId, userId) {
    try {
      // Utiliser la vue discussions_with_details
      const { data, error } = await supabase
        .from('discussions_with_details')
        .select('*')
        .eq('id', discussionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération discussion:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans getDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {Object} updates - Mises à jour
   * @param {string} userId - ID de l'utilisateur
   */
  async updateDiscussion(discussionId, updates, userId) {
    try {
      // Vérifier les permissions
      const { data: participant } = await supabase
        .from('discussion_participants')
        .select('role')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .single();

      if (!participant || (participant.role !== 'admin' && participant.role !== 'moderator')) {
        return { success: false, error: 'Permissions insuffisantes' };
      }

      // Mettre à jour la discussion
      const { data, error } = await supabase
        .from('discussions')
        .update({
          name: updates.name,
          description: updates.description,
          avatar_url: updates.avatar_url,
          is_public: updates.is_public,
          max_participants: updates.max_participants,
          metadata: updates.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', discussionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour discussion:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Discussion mise à jour:', discussionId);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans updateDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajouter un participant à une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID du nouvel utilisateur
   * @param {string} addedBy - ID de l'utilisateur qui ajoute
   * @param {string} role - Rôle du nouveau participant
   */
  async addParticipant(discussionId, userId, addedBy, role = 'member') {
    try {
      // Vérifier les permissions
      const { data: adder } = await supabase
        .from('discussion_participants')
        .select('role')
        .eq('discussion_id', discussionId)
        .eq('user_id', addedBy)
        .single();

      if (!adder || (adder.role !== 'admin' && adder.role !== 'moderator')) {
        return { success: false, error: 'Permissions insuffisantes' };
      }

      // Vérifier le nombre de participants
      const { count } = await supabase
        .from('discussion_participants')
        .select('*', { count: 'exact', head: true })
        .eq('discussion_id', discussionId)
        .eq('is_active', true);

      const { data: discussion } = await supabase
        .from('discussions')
        .select('max_participants')
        .eq('id', discussionId)
        .single();

      if (count >= discussion.max_participants) {
        return { success: false, error: 'Nombre maximum de participants atteint' };
      }

      // Ajouter le participant
      const { data, error } = await supabase
        .from('discussion_participants')
        .upsert({
          discussion_id: discussionId,
          user_id: userId,
          role,
          is_active: true,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur ajout participant:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Participant ajouté:', userId);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans addParticipant:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retirer un participant d'une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur à retirer
   * @param {string} removedBy - ID de l'utilisateur qui retire
   */
  async removeParticipant(discussionId, userId, removedBy) {
    try {
      // Vérifier les permissions
      const { data: remover } = await supabase
        .from('discussion_participants')
        .select('role')
        .eq('discussion_id', discussionId)
        .eq('user_id', removedBy)
        .single();

      if (!remover || (remover.role !== 'admin' && remover.role !== 'moderator' && removedBy !== userId)) {
        return { success: false, error: 'Permissions insuffisantes' };
      }

      // Marquer le participant comme inactif
      const { data, error } = await supabase
        .from('discussion_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur retrait participant:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Participant retiré:', userId);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans removeParticipant:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Changer le rôle d'un participant
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   * @param {string} newRole - Nouveau rôle
   * @param {string} changedBy - ID de l'utilisateur qui change
   */
  async changeParticipantRole(discussionId, userId, newRole, changedBy) {
    try {
      // Vérifier les permissions (seul admin peut changer les rôles)
      const { data: changer } = await supabase
        .from('discussion_participants')
        .select('role')
        .eq('discussion_id', discussionId)
        .eq('user_id', changedBy)
        .single();

      if (!changer || changer.role !== 'admin') {
        return { success: false, error: 'Seul un administrateur peut changer les rôles' };
      }

      // Mettre à jour le rôle
      const { data, error } = await supabase
        .from('discussion_participants')
        .update({ role: newRole })
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur changement rôle:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Rôle modifié:', userId, '->', newRole);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans changeParticipantRole:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer la liste des participants d'une discussion
   * @param {string} discussionId - ID de la discussion
   */
  async getParticipants(discussionId) {
    try {
      const { data, error } = await supabase
        .from('discussion_participants')
        .select(`
          *,
          user:user_id(
            id,
            name,
            username,
            avatar_url,
            status,
            is_online,
            last_seen
          )
        `)
        .eq('discussion_id', discussionId)
        .eq('is_active', true)
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération participants:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('❌ Erreur dans getParticipants:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Épingler/désépingler une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {boolean} pinned - État épinglé
   */
  async togglePinDiscussion(discussionId, pinned) {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .update({ is_pinned: pinned })
        .eq('id', discussionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur épinglage discussion:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans togglePinDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Archiver/désarchiver une discussion
   * @param {string} discussionId - ID de la discussion
   * @param {boolean} archived - État archivé
   */
  async toggleArchiveDiscussion(discussionId, archived) {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .update({ is_archived: archived })
        .eq('id', discussionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur archivage discussion:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans toggleArchiveDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mute/unmute une discussion pour un participant
   * @param {string} discussionId - ID de la discussion
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} muted - État muet
   */
  async toggleMuteDiscussion(discussionId, userId, muted) {
    try {
      const { data, error } = await supabase
        .from('discussion_participants')
        .update({ is_muted: muted })
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mute discussion:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans toggleMuteDiscussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer un lien d'invitation pour une discussion publique
   * @param {string} discussionId - ID de la discussion
   */
  async generateInviteLink(discussionId) {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 15);
      const inviteLink = `${window.location.origin}/join/${inviteCode}`;

      const { data, error } = await supabase
        .from('discussions')
        .update({ invite_link: inviteLink })
        .eq('id', discussionId)
        .select('invite_link')
        .single();

      if (error) {
        console.error('❌ Erreur génération lien invitation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.invite_link };

    } catch (error) {
      console.error('❌ Erreur dans generateInviteLink:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Rejoindre une discussion via lien d'invitation
   * @param {string} inviteLink - Lien d'invitation
   * @param {string} userId - ID de l'utilisateur
   */
  async joinViaInviteLink(inviteLink, userId) {
    try {
      // Trouver la discussion
      const { data: discussion, error: findError } = await supabase
        .from('discussions')
        .select('id, name, is_public')
        .eq('invite_link', inviteLink)
        .single();

      if (findError || !discussion) {
        return { success: false, error: 'Lien d\'invitation invalide' };
      }

      if (!discussion.is_public) {
        return { success: false, error: 'Cette discussion n\'est pas publique' };
      }

      // Ajouter le participant
      const result = await this.addParticipant(discussion.id, userId, userId);
      
      if (result.success) {
        return { success: true, data: { ...result.data, discussion } };
      }

      return result;

    } catch (error) {
      console.error('❌ Erreur dans joinViaInviteLink:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Rechercher des discussions
   * @param {string} query - Terme de recherche
   * @param {string} userId - ID de l'utilisateur
   */
  async searchDiscussions(query, userId) {
    try {
      const { data, error } = await supabase
        .from('discussions_with_details')
        .select('*')
        .eq('user_id', userId)
        .or(`display_name.ilike.%${query}%,last_message_content.ilike.%${query}%`)
        .order('last_message_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Erreur recherche discussions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };

    } catch (error) {
      console.error('❌ Erreur dans searchDiscussions:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton
const discussionService = new DiscussionService();

export default discussionService;
