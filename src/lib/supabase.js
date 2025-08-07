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
    
    return { data, error }
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
    
    return { data, error }
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
      .select()
    
    return { data, error }
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

    if (discussionError) return { error: discussionError }

    // Ajouter les participants
    const participants = participantIds.map(userId => ({
      discussion_id: discussion.id,
      user_id: userId
    }))

    const { error: participantsError } = await supabase
      .from('discussion_participants')
      .insert(participants)

    return { data: discussion, error: participantsError }
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    return { data, error }
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
      .select()
    
    return { data, error }
  },

  // Mettre à jour le statut d'un appel
  updateCallStatus: async (callId, status) => {
    const { data, error } = await supabase
      .from('calls')
      .update({ status, ended_at: status === 'ended' ? new Date().toISOString() : null })
      .eq('id', callId)
      .select()
    
    return { data, error }
  },

  // Récupérer l'historique des appels
  getCallHistory: async (userId) => {
    const { data, error } = await supabase
      .from('calls')
      .select(`
        *,
        discussion:discussions(name),
        initiator:users(id, name, avatar_url)
      `)
      .or(`initiator_id.eq.${userId},participants.user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

export default supabase 