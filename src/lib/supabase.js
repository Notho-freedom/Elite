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
  // Récupérer les discussions
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
          content,
          created_at,
          sender_id
        )
      `)
      .eq('participants.user_id', userId)
      .order('last_message.created_at', { ascending: false })
    
    if (error) {
      console.error('Erreur lors de la récupération des discussions:', error);
      return { data: [], error };
    }

    // Transformer les données pour correspondre au format attendu
    const transformedData = data?.map(discussion => {
      const participants = discussion.participants || [];
      const otherParticipants = participants.filter(p => p.user_id !== userId);
      
      return {
        id: discussion.id,
        name: discussion.name || (otherParticipants.length > 0 ? otherParticipants[0].users?.name : 'Discussion'),
        avatar: otherParticipants[0]?.users?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastMessage: discussion.last_message?.[0]?.content || 'Aucun message',
        unread: false, // À implémenter avec un système de marquage
        isOnline: otherParticipants.some(p => p.users?.status === 'online'),
        type: discussion.type,
        participants: participants.map(p => p.users).filter(Boolean)
      };
    }) || [];

    return { data: transformedData, error: null };
  },

  // Récupérer les messages d'une discussion
  getMessages: async (discussionId, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name, avatar_url)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return { data: [], error };
    }

    // Transformer les données pour correspondre au format attendu
    const transformedData = data?.map(message => ({
      id: message.id,
      content: message.content,
      sender: message.sender?.name || 'Utilisateur',
      senderId: message.sender_id,
      avatar: message.sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      timestamp: message.created_at,
      type: message.message_type || 'text'
    })) || [];

    return { data: transformedData, error: null };
  },

  // Envoyer un message
  sendMessage: async (discussionId, senderId, content, messageType = 'text') => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        discussion_id: discussionId,
        sender_id: senderId,
        content,
        message_type: messageType
      })
      .select(`
        *,
        sender:users(id, name, avatar_url)
      `)
    
    if (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return { data: null, error };
    }

    // Transformer le message envoyé
    const transformedMessage = {
      id: data[0].id,
      content: data[0].content,
      sender: data[0].sender?.name || 'Utilisateur',
      senderId: data[0].sender_id,
      avatar: data[0].sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      timestamp: data[0].created_at,
      type: data[0].message_type || 'text'
    };

    return { data: [transformedMessage], error: null };
  },

  // Créer une nouvelle discussion
  createDiscussion: async (participantIds, name = null) => {
    const { data: discussion, error: discussionError } = await supabase
      .from('discussions')
      .insert({
        name,
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

// Fonctions pour les appels
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