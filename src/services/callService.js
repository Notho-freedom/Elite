import { supabase } from '../lib/supabase';

/**
 * Service pour la gestion des appels audio/vidéo
 * Compatible avec le schéma database_schema_updated.sql
 */
class CallService {
  constructor() {
    this.activeCall = null;
    this.peerConnections = new Map();
    this.localStream = null;
    this.remoteStreams = new Map();
    this.callSubscription = null;
  }

  /**
   * Initialiser un nouvel appel
   * @param {string} discussionId - ID de la discussion
   * @param {string} initiatorId - ID de l'initiateur
   * @param {string} callType - Type d'appel ('audio', 'video', 'screen_share')
   * @param {Array} participantIds - IDs des participants à appeler
   */
  async initiateCall(discussionId, initiatorId, callType = 'audio', participantIds = []) {
    try {
      console.log('🔄 Initialisation appel:', callType);

      // Créer l'appel en base de données
      const { data: call, error } = await supabase
        .from('calls')
        .insert({
          discussion_id: discussionId,
          initiator_id: initiatorId,
          call_type: callType,
          status: 'ringing',
          started_at: new Date().toISOString()
        })
        .select(`
          *,
          discussion:discussion_id(name, type),
          initiator:initiator_id(name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('❌ Erreur création appel:', error);
        return { success: false, error: error.message };
      }

      // Ajouter les participants
      if (participantIds.length > 0) {
        const participants = participantIds.map(userId => ({
          call_id: call.id,
          user_id: userId,
          status: 'invited',
          is_muted: false,
          is_video_enabled: callType === 'video',
          invited_at: new Date().toISOString()
        }));

        const { error: participantsError } = await supabase
          .from('call_participants')
          .insert(participants);

        if (participantsError) {
          console.error('❌ Erreur ajout participants appel:', participantsError);
        }
      }

      // Ajouter l'initiateur comme participant
      await supabase
        .from('call_participants')
        .insert({
          call_id: call.id,
          user_id: initiatorId,
          status: 'joined',
          is_muted: false,
          is_video_enabled: callType === 'video',
          invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString()
        });

      this.activeCall = call;

      // Notifier les participants
      await this.notifyParticipants(call.id, participantIds, 'incoming_call');

      console.log('✅ Appel initié:', call.id);
      return { success: true, data: call };

    } catch (error) {
      console.error('❌ Erreur dans initiateCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Rejoindre un appel existant
   * @param {string} callId - ID de l'appel
   * @param {string} userId - ID de l'utilisateur
   */
  async joinCall(callId, userId) {
    try {
      console.log('🔄 Rejoindre appel:', callId);

      // Vérifier l'état de l'appel
      const { data: call, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (callError || !call) {
        return { success: false, error: 'Appel introuvable' };
      }

      if (call.status === 'ended') {
        return { success: false, error: 'L\'appel est terminé' };
      }

      // Mettre à jour le statut du participant
      const { data: participant, error: participantError } = await supabase
        .from('call_participants')
        .update({
          status: 'joined',
          joined_at: new Date().toISOString()
        })
        .eq('call_id', callId)
        .eq('user_id', userId)
        .select()
        .single();

      if (participantError) {
        console.error('❌ Erreur mise à jour participant:', participantError);
        return { success: false, error: participantError.message };
      }

      // Si c'est le premier à répondre, mettre à jour le statut de l'appel
      if (call.status === 'ringing') {
        await supabase
          .from('calls')
          .update({
            status: 'active',
            answered_at: new Date().toISOString()
          })
          .eq('id', callId);
      }

      this.activeCall = call;

      console.log('✅ Appel rejoint:', callId);
      return { success: true, data: { call, participant } };

    } catch (error) {
      console.error('❌ Erreur dans joinCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Quitter un appel
   * @param {string} callId - ID de l'appel
   * @param {string} userId - ID de l'utilisateur
   */
  async leaveCall(callId, userId) {
    try {
      console.log('🔄 Quitter appel:', callId);

      // Mettre à jour le statut du participant
      await supabase
        .from('call_participants')
        .update({
          status: 'left',
          left_at: new Date().toISOString()
        })
        .eq('call_id', callId)
        .eq('user_id', userId);

      // Vérifier s'il reste des participants actifs
      const { count } = await supabase
        .from('call_participants')
        .select('*', { count: 'exact', head: true })
        .eq('call_id', callId)
        .eq('status', 'joined');

      // Si plus personne, terminer l'appel
      if (count === 0) {
        await this.endCall(callId);
      }

      // Nettoyer les ressources locales
      this.cleanupCall();

      console.log('✅ Appel quitté:', callId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans leaveCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Terminer un appel
   * @param {string} callId - ID de l'appel
   */
  async endCall(callId) {
    try {
      console.log('🔄 Fin appel:', callId);

      // Calculer la durée
      const { data: call } = await supabase
        .from('calls')
        .select('started_at')
        .eq('id', callId)
        .single();

      const duration = call ? Math.floor((Date.now() - new Date(call.started_at).getTime()) / 1000) : 0;

      // Mettre à jour l'appel
      const { error } = await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration
        })
        .eq('id', callId);

      if (error) {
        console.error('❌ Erreur fin appel:', error);
        return { success: false, error: error.message };
      }

      // Mettre à jour tous les participants restants
      await supabase
        .from('call_participants')
        .update({
          status: 'left',
          left_at: new Date().toISOString()
        })
        .eq('call_id', callId)
        .in('status', ['joined', 'invited']);

      console.log('✅ Appel terminé:', callId, 'Durée:', duration, 's');
      return { success: true, duration };

    } catch (error) {
      console.error('❌ Erreur dans endCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Décliner un appel
   * @param {string} callId - ID de l'appel
   * @param {string} userId - ID de l'utilisateur
   */
  async declineCall(callId, userId) {
    try {
      console.log('🔄 Décliner appel:', callId);

      // Mettre à jour le statut du participant
      await supabase
        .from('call_participants')
        .update({
          status: 'declined',
          left_at: new Date().toISOString()
        })
        .eq('call_id', callId)
        .eq('user_id', userId);

      // Vérifier si tous ont décliné
      const { count } = await supabase
        .from('call_participants')
        .select('*', { count: 'exact', head: true })
        .eq('call_id', callId)
        .in('status', ['invited', 'joined']);

      if (count === 0) {
        // Marquer l'appel comme manqué
        await supabase
          .from('calls')
          .update({
            status: 'missed',
            ended_at: new Date().toISOString()
          })
          .eq('id', callId);
      }

      console.log('✅ Appel décliné:', callId);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur dans declineCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Basculer l'état du micro
   * @param {string} callId - ID de l'appel
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} muted - État muet
   */
  async toggleMute(callId, userId, muted) {
    try {
      const { data, error } = await supabase
        .from('call_participants')
        .update({ is_muted: muted })
        .eq('call_id', callId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur toggle mute:', error);
        return { success: false, error: error.message };
      }

      // Mettre à jour le stream local
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = !muted;
        });
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans toggleMute:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Basculer l'état de la vidéo
   * @param {string} callId - ID de l'appel
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} enabled - État vidéo
   */
  async toggleVideo(callId, userId, enabled) {
    try {
      const { data, error } = await supabase
        .from('call_participants')
        .update({ is_video_enabled: enabled })
        .eq('call_id', callId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur toggle video:', error);
        return { success: false, error: error.message };
      }

      // Mettre à jour le stream local
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans toggleVideo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer l'historique des appels
   * @param {string} userId - ID de l'utilisateur
   * @param {number} limit - Limite de résultats
   */
  async getCallHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          discussion:discussion_id(name, type, avatar_url),
          initiator:initiator_id(name, avatar_url),
          call_participants!inner(
            user_id,
            status,
            user:user_id(name, avatar_url)
          )
        `)
        .or(`initiator_id.eq.${userId},call_participants.user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erreur récupération historique:', error);
        return { success: false, error: error.message };
      }

      // Formater les données pour l'UI
      const formattedCalls = data?.map(call => ({
        id: call.id,
        type: call.call_type,
        status: call.status,
        duration: call.duration || 0,
        startedAt: call.started_at,
        endedAt: call.ended_at,
        discussion: call.discussion,
        initiator: call.initiator,
        participants: call.call_participants,
        
        // Calculer si c'est un appel entrant/sortant
        isIncoming: call.initiator_id !== userId,
        
        // Formater la durée
        formattedDuration: this.formatDuration(call.duration || 0),
        
        // Formater la date
        formattedDate: this.formatCallDate(call.started_at)
      })) || [];

      return { success: true, data: formattedCalls };

    } catch (error) {
      console.error('❌ Erreur dans getCallHistory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir un appel actif
   * @param {string} userId - ID de l'utilisateur
   */
  async getActiveCall(userId) {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          discussion:discussion_id(name, type, avatar_url),
          initiator:initiator_id(name, avatar_url),
          call_participants(
            *,
            user:user_id(name, avatar_url, status, is_online)
          )
        `)
        .in('status', ['ringing', 'active'])
        .or(`initiator_id.eq.${userId},call_participants.user_id.eq.${userId}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Aucun résultat
          return { success: true, data: null };
        }
        console.error('❌ Erreur récupération appel actif:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur dans getActiveCall:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * S'abonner aux mises à jour d'appel en temps réel
   * @param {string} callId - ID de l'appel
   * @param {Object} callbacks - Callbacks pour les événements
   */
  subscribeToCall(callId, callbacks = {}) {
    try {
      console.log('🔄 Abonnement temps réel appel:', callId);

      // Nettoyer l'abonnement existant
      this.unsubscribeFromCall();

      this.callSubscription = supabase
        .channel(`call:${callId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`
        }, (payload) => {
          console.log('📞 Mise à jour appel:', payload.eventType);
          if (callbacks.onCallUpdate) {
            callbacks.onCallUpdate(payload.new);
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'call_participants',
          filter: `call_id=eq.${callId}`
        }, (payload) => {
          console.log('👥 Mise à jour participants:', payload.eventType);
          if (callbacks.onParticipantUpdate) {
            callbacks.onParticipantUpdate(payload);
          }
        })
        .subscribe();

      console.log('✅ Abonnement appel activé');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur abonnement appel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Se désabonner des mises à jour d'appel
   */
  unsubscribeFromCall() {
    if (this.callSubscription) {
      supabase.removeChannel(this.callSubscription);
      this.callSubscription = null;
      console.log('🔌 Désabonnement appel');
    }
  }

  /**
   * Notifier les participants d'un appel
   * @param {string} callId - ID de l'appel
   * @param {Array} participantIds - IDs des participants
   * @param {string} type - Type de notification
   */
  async notifyParticipants(callId, participantIds, type) {
    try {
      const notifications = participantIds.map(userId => ({
        user_id: userId,
        type: 'call',
        title: 'Appel entrant',
        body: 'Vous avez un appel entrant',
        data: { callId, type },
        priority: 'urgent'
      }));

      await supabase
        .from('notifications')
        .insert(notifications);

    } catch (error) {
      console.error('❌ Erreur notification participants:', error);
    }
  }

  /**
   * Obtenir le stream média local
   * @param {Object} constraints - Contraintes média
   */
  async getLocalStream(constraints = { audio: true, video: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream local obtenu');
      return this.localStream;
    } catch (error) {
      console.error('❌ Erreur obtention stream local:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les ressources d'appel
   */
  cleanupCall() {
    // Arrêter le stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Fermer les connexions peer
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Nettoyer les streams distants
    this.remoteStreams.clear();

    // Réinitialiser l'appel actif
    this.activeCall = null;

    console.log('🧹 Ressources appel nettoyées');
  }

  /**
   * Formater la durée d'appel
   * @param {number} seconds - Durée en secondes
   */
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Formater la date d'appel
   * @param {string} dateString - Date ISO
   */
  formatCallDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  }
}

// Instance singleton
const callService = new CallService();

export default callService;
