import { createClient } from '@supabase/supabase-js'
import { formatMessageForUI, transformReactions } from './messageFormatter.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Présent' : 'Manquant');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Fonctions utilitaires pour l'authentification
export const auth = {
  // Connexion avec email/mot de passe
  signInWithPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Inscription avec email/mot de passe
  signUpWithPassword: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Connexion avec OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    })
    return { data, error }
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Écouter les changements d'authentification
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Fonctions utilitaires pour les données
export const db = {
  // Récupérer les discussions avec le dernier message formaté
  getDiscussions: async (userId) => {
    let data = [];
    let error = null;

    try {
      const response = await supabase
        .from('discussions')
        .select(`
          *,
          participants:discussion_participants(
            user_id,
            users(id, name, avatar_url, status)
          ),
          last_message:messages(
            id,
            content,
            message_type,
            media_url,
            created_at,
            sender:users(name)
          )
        `)
        .eq('participants.user_id', userId)
        .order('updated_at', { ascending: false });
      
      data = response.data;
      error = response.error;
      
      if (error) {
        // Gestion spéciale pour la récursion RLS
        if (error.code === '42P17') {
          console.warn('⚠️ Récursion RLS détectée - utilisation du mode dégradé');
          console.warn('📝 Appliquez le correctif RLS : voir SOLUTION_IMMEDIATE.sql');
          
          // Mode dégradé : retourner des données mockées avec un indicateur d'erreur
          return { 
            data: [], 
            error: null, // Ne pas bloquer l'app
            warning: 'RLS_RECURSION_DETECTED',
            message: 'Politiques RLS à corriger - Mode démonstration activé'
          };
        }
        
        console.error('Erreur lors de la récupération des discussions:', error);
        return { data: [], error };
      }
    } catch (networkError) {
      console.warn('Erreur réseau Supabase - mode hors ligne activé:', networkError);
      return { 
        data: [], 
        error: null,
        warning: 'NETWORK_ERROR',
        message: 'Mode hors ligne - Vérifiez votre connexion'
      };
    }

    // Transformer les données pour correspondre au format attendu
    const transformedData = data?.map(discussion => {
      const participants = discussion.participants || [];
      const otherParticipants = participants.filter(p => p.user_id !== userId);
      
      // Trouver le dernier message et le formater correctement
      const lastMessage = discussion.last_message?.[0];
      let lastMessagePreview = 'Aucun message';
      
      if (lastMessage) {
        if (lastMessage.message_type === 'text') {
          lastMessagePreview = lastMessage.content || 'Message texte';
        } else if (lastMessage.message_type === 'image') {
          lastMessagePreview = '📷 Photo';
        } else if (lastMessage.message_type === 'video') {
          lastMessagePreview = '🎥 Vidéo';
        } else if (lastMessage.message_type === 'audio') {
          lastMessagePreview = '🎵 Message vocal';
        } else if (lastMessage.message_type === 'file') {
          lastMessagePreview = '📎 Fichier';
        } else {
          lastMessagePreview = lastMessage.content || 'Message';
        }
      }
      
      return {
        id: discussion.id,
        name: discussion.name || (otherParticipants.length > 0 ? otherParticipants[0].users?.name : 'Discussion'),
        avatar: otherParticipants[0]?.users?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastMessage: lastMessagePreview,
        lastMessageTime: lastMessage?.created_at || discussion.created_at,
        unread: false, // À implémenter avec un système de marquage
        isOnline: otherParticipants.some(p => p.users?.status === 'online'),
        type: discussion.type,
        participants: participants.map(p => p.users).filter(Boolean)
      };
    }) || [];

    // Trier par le timestamp du dernier message (plus récent en premier)
    transformedData.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return { data: transformedData, error: null };
  },

  // Récupérer les messages d'une discussion (ordre chronologique)
  getMessages: async (discussionId, limit = 50, offset = 0) => {
    // Récupérer l'utilisateur actuel
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(
          id, 
          content, 
          message_type,
          media_url,
          media_type,
          media_name,
          thumbnail_url,
          created_at,
          sender:users(id, name, avatar_url)
        )
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true }) // Plus anciens en premier, récents en bas
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return { data: [], error };
    }

    // Transformer les données avec le nouveau formateur universel
    const transformedData = data?.map(message => 
      formatMessageForUI(message, currentUser?.id)
    ) || [];

    return { data: transformedData, error: null };
  },

  // Envoyer un message (gérer texte et média séparément)
  sendMessage: async (discussionId, senderId, messageData) => {
    try {
      const messages = [];
      
      console.log('🚀 Envoi message - Données reçues:', { discussionId, senderId, messageData });
      
      // Normaliser les données d'entrée
      let content = '';
      let mediaList = [];
      
      if (typeof messageData === 'string') {
        content = messageData.trim();
      } else if (messageData && typeof messageData === 'object') {
        content = (messageData.message || messageData.text || messageData.content || '').trim();
        mediaList = messageData.media || [];
      }
      
      console.log('📝 Contenu normalisé:', { content, mediaList: mediaList.length });
      
      // Récupérer reply_to_id si présent
      const replyToId = messageData.reply_to_id || null;
      console.log('📨 Reply To ID détecté:', replyToId);
      
      // Envoyer le message texte si présent
      if (content) {
        const textMessage = {
          discussion_id: discussionId,
          sender_id: senderId,
          content: content,
          message_type: 'text',
          reply_to_id: replyToId,
          status: 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('💬 Insertion message texte:', textMessage);
          
        const { data: textData, error: textError } = await supabase
          .from('messages')
          .insert(textMessage)
          .select(`
            *,
            sender:users(id, name, avatar_url)
          `);
          
        if (textError) {
          console.error('❌ Erreur insertion texte:', textError);
          throw textError;
        }
        
        console.log('✅ Message texte inséré:', textData);
        messages.push(...textData);
      }
      
      // Envoyer les médias si présents
      if (mediaList && mediaList.length > 0) {
        for (const [index, media] of mediaList.entries()) {
          const mediaMessage = {
            discussion_id: discussionId,
            sender_id: senderId,
            content: media.caption || '', // Légende du média
            message_type: getMessageTypeFromMedia(media),
            media_url: media.url || null,
            media_type: media.type || null,
            media_size: media.size || null,
            media_name: media.name || `media_${index + 1}`,
            thumbnail_url: media.thumbnail || null,
            reply_to_id: replyToId,
            status: 'sent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log(`📎 Insertion média ${index + 1}:`, mediaMessage);
          
          const { data: mediaData, error: mediaError } = await supabase
            .from('messages')
            .insert(mediaMessage)
            .select(`
              *,
              sender:users(id, name, avatar_url)
            `);
            
          if (mediaError) {
            console.error(`❌ Erreur insertion média ${index + 1}:`, mediaError);
            throw mediaError;
          }
          
          console.log(`✅ Média ${index + 1} inséré:`, mediaData);
          messages.push(...mediaData);
        }
      }
      
      // Vérifier qu'au moins un message a été créé
      if (messages.length === 0) {
        throw new Error('Aucun contenu à envoyer (texte ou média requis)');
      }

      // Mettre à jour le timestamp de la discussion
      await supabase
        .from('discussions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', discussionId);

      // Transformer les messages avec le formateur universel
      const transformedMessages = messages.map(message => 
        formatMessageForUI(message, senderId)
      );
      
      console.log('🎯 Messages transformés pour UI:', transformedMessages);

      return { data: transformedMessages, error: null };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      return { data: null, error };
    }
  },

  // Créer une nouvelle discussion
  createDiscussion: async (participantIds, name = null) => {
    const { data: discussion, error: discussionError } = await supabase
      .from('discussions')
      .insert({
        name,
        type: participantIds.length > 2 ? 'group' : 'private',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (discussionError) {
      console.error('Erreur lors de la création de la discussion:', discussionError);
      return { data: null, error: discussionError };
    }

    // Ajouter les participants
    const participants = participantIds.map(userId => ({
      discussion_id: discussion.id,
      user_id: userId
    }))

    const { error: participantsError } = await supabase
      .from('discussion_participants')
      .insert(participants)

    if (participantsError) {
      console.error('Erreur lors de l\'ajout des participants:', participantsError);
      return { data: null, error: participantsError };
    }

    return { data: discussion, error: null };
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  // Récupérer tous les utilisateurs (pour les suggestions)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, status')
      .order('name')
    
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return { data: [], error };
    }

    return { data, error: null };
  }
}

// Fonctions utilitaires
function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) {
      // Moins de 24h : afficher l'heure
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      // Moins d'une semaine : afficher le jour
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Plus d'une semaine : afficher la date
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return '';
  }
}

function getMessageTypeFromMedia(media) {
  if (!media.type && !media.url) return 'file';
  
  const type = media.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/') || type === 'voice') return 'audio';
  return 'file';
}

// Fonctions pour les appels (inchangées)
export const calls = {
  // Créer un appel
  createCall: async (discussionId, initiatorId, callType = 'audio') => {
    const { data, error } = await supabase
      .from('calls')
      .insert({
        discussion_id: discussionId,
        initiator_id: initiatorId,
        call_type: callType,
        status: 'active'
      })
      .select(`
        *,
        discussion:discussions(name),
        initiator:users(id, name, avatar_url)
      `)
    
    if (error) {
      console.error('Erreur lors de la création de l\'appel:', error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  // Mettre à jour le statut d'un appel
  updateCallStatus: async (callId, status) => {
    const { data, error } = await supabase
      .from('calls')
      .update({ 
        status, 
        ended_at: status === 'ended' ? new Date().toISOString() : null,
        duration: status === 'ended' ? 
          `EXTRACT(EPOCH FROM (NOW() - started_at))::integer` : null
      })
      .eq('id', callId)
      .select()
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'appel:', error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  // Récupérer l'historique des appels
  getCallHistory: async (userId) => {
    let data = [];
    let error = null;

    try {
      const response = await supabase
        .from('calls')
        .select(`
          *,
          discussion:discussions(name),
          initiator:users(id, name, avatar_url),
          participants:call_participants(
            user_id,
            users(id, name, avatar_url)
          )
        `)
        .or(`initiator_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      data = response.data;
      error = response.error;
      
      if (error) {
        // Gestion spéciale pour la récursion RLS
        if (error.code === '42P17') {
          console.warn('⚠️ Récursion RLS détectée sur les appels - mode dégradé');
          return { 
            data: [], 
            error: null,
            warning: 'RLS_RECURSION_CALLS',
            message: 'Historique des appels indisponible - Corrigez les politiques RLS'
          };
        }
        
        console.error('Erreur lors de la récupération de l\'historique des appels:', error);
        return { data: [], error };
      }
    } catch (networkError) {
      console.warn('Erreur réseau appels:', networkError);
      return { 
        data: [], 
        error: null,
        warning: 'NETWORK_ERROR',
        message: 'Historique des appels indisponible hors ligne'
      };
    }

    // Transformer les données pour correspondre au format attendu
    const transformedData = data?.map(call => ({
      id: call.id,
      name: call.discussion?.name || 'Appel',
      avatar: call.initiator?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      type: call.call_type,
      status: call.status,
      duration: call.duration || 0,
      timestamp: call.created_at,
      initiator: call.initiator?.name || 'Utilisateur'
    })) || [];

    return { data: transformedData, error: null };
  }
}

export default supabase 