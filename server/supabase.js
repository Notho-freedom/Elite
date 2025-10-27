import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export function initSupabase() {
  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY || config.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );

  console.log('✅ Supabase initialisé');
  return supabase;
}

// Fonctions utilitaires pour les transformations de données

export function transformDiscussion(discussion, currentUserId) {
  if (!discussion) return null;

  const participants = discussion.participants || [];
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId);
  
  // Trouver le dernier message
  const lastMessage = discussion.last_message?.[0] || discussion.messages?.[0];
  let lastMessagePreview = 'Aucun message';
  
  if (lastMessage) {
    switch (lastMessage.message_type) {
      case 'text':
        lastMessagePreview = lastMessage.content || 'Message texte';
        break;
      case 'image':
        lastMessagePreview = '📷 Photo';
        break;
      case 'video':
        lastMessagePreview = '🎥 Vidéo';
        break;
      case 'audio':
        lastMessagePreview = '🎵 Message vocal';
        break;
      case 'file':
        lastMessagePreview = '📎 Fichier';
        break;
      default:
        lastMessagePreview = lastMessage.content || 'Message';
    }
  }
  
  return {
    id: discussion.id,
    name: discussion.name || (otherParticipants.length > 0 ? otherParticipants[0].users?.name : 'Discussion'),
    avatar: discussion.avatar_url || otherParticipants[0]?.users?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastMessage: lastMessagePreview,
    lastMessageTime: lastMessage?.created_at || discussion.created_at,
    unread: false, // À implémenter avec le système de lecture
    isOnline: otherParticipants.some(p => p.users?.status === 'online'),
    type: discussion.type,
    participants: participants.map(p => p.users).filter(Boolean),
    isArchived: discussion.is_archived,
    isMuted: discussion.is_muted,
    isPinned: discussion.is_pinned
  };
}

export function transformMessage(message, currentUserId) {
  if (!message) return null;

  return {
    id: message.id,
    text: message.content || '',
    sender: message.sender_id === currentUserId ? 'me' : message.sender?.name || 'Utilisateur',
    senderId: message.sender_id,
    avatar: message.sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    timestamp: message.created_at,
    time: formatMessageTime(message.created_at),
    type: message.message_type || 'text',
    isRead: message.status === 'read',
    status: message.status || 'sent',
    reactions: transformReactions(message.reactions || []),
    replyTo: message.reply_to ? {
      id: message.reply_to.id,
      text: message.reply_to.content,
      sender: message.reply_to.sender?.name
    } : null,
    isEdited: message.is_edited || false,
    isDeleted: message.is_deleted || false,
    isPinned: message.is_pinned || false,
    isImportant: message.is_important || false,
    media: message.media_url ? [{
      id: `media-${message.id}`,
      url: message.media_url,
      type: message.message_type,
      name: message.media_name,
      size: message.media_size,
      thumbnail: message.thumbnail_url
    }] : undefined
  };
}

export function transformReactions(reactions) {
  if (!Array.isArray(reactions)) return [];
  
  return reactions.map(reaction => ({
    emoji: reaction.emoji,
    users: reaction.users || [],
    count: reaction.users?.length || 0
  }));
}

export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) {
      // Moins de 24h : afficher l'heure
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      // Moins d'une semaine : afficher le jour
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      // Plus d'une semaine : afficher la date
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return '';
  }
}
