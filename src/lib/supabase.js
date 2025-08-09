import { createClient } from '@supabase/supabase-js'

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
    const { data, error } = await supabase
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
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Erreur lors de la récupération des discussions:', error);
      return { data: [], error };
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
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name, avatar_url),
        reply_to:reply_to_id(id, content, sender:users(name))
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true }) // Plus anciens en premier, récents en bas
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return { data: [], error };
    }

    // Transformer les données pour correspondre au format attendu du front-end
    const transformedData = data?.map(message => {
      const transformedMessage = {
        id: message.id,
        text: message.content || '',
        sender: message.sender_id === 'current_user' ? 'me' : message.sender?.name || 'Utilisateur',
        senderId: message.sender_id,
        avatar: message.sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        timestamp: message.created_at,
        time: formatMessageTime(message.created_at),
        type: message.message_type || 'text',
        isRead: true, // À implémenter selon la logique métier
        reactions: [], // À implémenter
        replyTo: message.reply_to ? {
          id: message.reply_to.id,
          text: message.reply_to.content,
          sender: message.reply_to.sender?.name
        } : null
      };

      // Ajouter les médias si présents
      if (message.media_url && message.message_type !== 'text') {
        transformedMessage.media = [{
          id: `media-${message.id}`,
          url: message.media_url,
          type: message.message_type,
          size: null, // À implémenter si nécessaire
          duration: null // À implémenter pour audio/video
        }];
      }

      return transformedMessage;
    }) || [];

    return { data: transformedData, error: null };
  },

  // Envoyer un message (gérer texte et média séparément)
  sendMessage: async (discussionId, senderId, messageData) => {
    try {
      const messages = [];
      
      // Si c'est un message avec texte et médias, on les sépare
      if (typeof messageData === 'object' && messageData.message && messageData.media?.length > 0) {
        // D'abord envoyer le message texte s'il y en a un
        if (messageData.message.trim()) {
          const textMessage = {
            discussion_id: discussionId,
            sender_id: senderId,
            content: messageData.message.trim(),
            message_type: 'text'
          };
          
          const { data: textData, error: textError } = await supabase
            .from('messages')
            .insert(textMessage)
            .select(`
              *,
              sender:users(id, name, avatar_url)
            `);
            
          if (textError) throw textError;
          messages.push(...textData);
        }
        
        // Ensuite envoyer chaque média comme un message séparé
        for (const media of messageData.media) {
          const mediaMessage = {
            discussion_id: discussionId,
            sender_id: senderId,
            content: '', // Pas de texte pour les médias purs
            message_type: getMessageTypeFromMedia(media),
            media_url: media.url || media.blob ? URL.createObjectURL(media.blob) : null
          };
          
          const { data: mediaData, error: mediaError } = await supabase
            .from('messages')
            .insert(mediaMessage)
            .select(`
              *,
              sender:users(id, name, avatar_url)
            `);
            
          if (mediaError) throw mediaError;
          messages.push(...mediaData);
        }
      } else {
        // Message simple (texte seulement)
        const simpleMessage = {
          discussion_id: discussionId,
          sender_id: senderId,
          content: typeof messageData === 'string' ? messageData : messageData.message || messageData.text,
          message_type: 'text'
        };
        
        const { data, error } = await supabase
          .from('messages')
          .insert(simpleMessage)
          .select(`
            *,
            sender:users(id, name, avatar_url)
          `);
          
        if (error) throw error;
        messages.push(...data);
      }

      // Mettre à jour le timestamp de la discussion
      await supabase
        .from('discussions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', discussionId);

      // Transformer les messages pour le front-end
      const transformedMessages = messages.map(message => ({
        id: message.id,
        text: message.content || '',
        sender: 'me',
        senderId: message.sender_id,
        avatar: message.sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        timestamp: message.created_at,
        time: formatMessageTime(message.created_at),
        type: message.message_type || 'text',
        isRead: false,
        reactions: [],
        media: message.media_url ? [{
          id: `media-${message.id}`,
          url: message.media_url,
          type: message.message_type
        }] : undefined
      }));

      return { data: transformedMessages, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
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
    const { data, error } = await supabase
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
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'historique des appels:', error);
      return { data: [], error };
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