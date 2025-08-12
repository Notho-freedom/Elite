// Utilitaires pour le formatage des messages Elite Chat
// Compatible avec tous les composants de chat existants

/**
 * Transforme un message de la base de données vers le format UI
 * Compatible avec MessageBubble, EnhancedMessageBubble, ChatMessage
 */
export function formatMessageForUI(dbMessage, currentUserId = null) {
  if (!dbMessage) return null;

  const isCurrentUser = currentUserId && dbMessage.sender_id === currentUserId;
  
  return {
    // IDs et identification - format universel
    id: dbMessage.id,
    senderId: dbMessage.sender_id,
    
    // Contenu - support double format (text/content) pour compatibilité
    text: dbMessage.content || '',
    content: dbMessage.content || '',
    
    // Expéditeur - format compatible avec tous les composants
    sender: isCurrentUser ? 'me' : (dbMessage.sender?.name || 'Utilisateur'),
    senderName: dbMessage.sender?.name || 'Utilisateur',
    avatar: dbMessage.sender?.avatar_url || generateDefaultAvatar(dbMessage.sender?.name),
    
    // Temporalité - formats multiples pour compatibilité
    timestamp: dbMessage.created_at,
    time: formatMessageTime(dbMessage.created_at),
    createdAt: dbMessage.created_at,
    updatedAt: dbMessage.updated_at,
    
    // Type et statut - gestion complète
    type: dbMessage.message_type || 'text',
    messageType: dbMessage.message_type || 'text',
    status: dbMessage.status || 'sent',
    isRead: dbMessage.status === 'read',
    
    // États booléens du message
    isEdited: Boolean(dbMessage.is_edited),
    isDeleted: Boolean(dbMessage.is_deleted),
    isPinned: Boolean(dbMessage.is_pinned),
    isImportant: Boolean(dbMessage.is_important),
    isSending: dbMessage.status === 'sending',
    hasFailed: dbMessage.status === 'failed',
    
    // Réactions - format array compatible
    reactions: formatReactions(dbMessage.reactions),
    hasReactions: Boolean(dbMessage.reactions?.length),
    
    // Réponse à un message - format complet
    replyTo: formatReplyTo(dbMessage.reply_to || dbMessage.reply_to_id),
    isReply: Boolean(dbMessage.reply_to_id),
    
    // Mentions et hashtags
    mentions: dbMessage.mentions || [],
    hasMentions: Boolean(dbMessage.mentions?.length),
    
    // Médias - format compatible avec MediaDisplay
    media: formatMedia(dbMessage),
    hasMedia: Boolean(dbMessage.media_url || dbMessage.media?.length),
    
    // Métadonnées étendues
    metadata: dbMessage.metadata || {},
    location: dbMessage.location,
    hasLocation: Boolean(dbMessage.location),
    
    // Détection automatique de contenu
    hasLinks: detectLinks(dbMessage.content),
    isEmojiOnly: detectEmojiOnly(dbMessage.content),
    isSingleEmoji: detectSingleEmoji(dbMessage.content),
    
    // Propriétés calculées pour l'affichage
    displayTime: formatDisplayTime(dbMessage.created_at),
    relativeTime: formatRelativeTime(dbMessage.created_at),
    editedTime: dbMessage.updated_at ? formatDisplayTime(dbMessage.updated_at) : null
  };
}

/**
 * Formate les réactions pour l'affichage
 */
export function formatReactions(reactions) {
  if (!reactions || !Array.isArray(reactions)) return [];
  
  return reactions.map(reaction => ({
    emoji: reaction.emoji,
    userId: reaction.userId || reaction.user_id,
    user_id: reaction.userId || reaction.user_id,
    users: reaction.users || [],
    count: reaction.users?.length || 1,
    userIds: reaction.users || [],
    created_at: reaction.created_at,
    // Compatibilité avec les anciens formats
    id: `reaction-${reaction.emoji}`,
    messageId: reaction.messageId || reaction.message_id
  }));
}

/**
 * Formate les médias pour l'affichage
 */
export function formatMedia(dbMessage) {
  const media = [];
  
  // Média unique depuis la base
  if (dbMessage.media_url) {
    media.push({
      id: `media-${dbMessage.id}`,
      url: dbMessage.media_url,
      type: dbMessage.message_type,
      mediaType: dbMessage.media_type,
      size: dbMessage.media_size,
      name: dbMessage.media_name,
      thumbnail: dbMessage.thumbnail_url,
      duration: null, // À calculer
      isImage: dbMessage.media_type?.startsWith('image/'),
      isVideo: dbMessage.media_type?.startsWith('video/'),
      isAudio: dbMessage.media_type?.startsWith('audio/'),
      isDocument: !['image/', 'video/', 'audio/'].some(t => dbMessage.media_type?.startsWith(t))
    });
  }
  
  // Support pour multiple médias (futur)
  if (dbMessage.media && Array.isArray(dbMessage.media)) {
    dbMessage.media.forEach((m, index) => {
      media.push({
        id: m.id || `media-${dbMessage.id}-${index}`,
        url: m.url,
        type: m.type,
        mediaType: m.mediaType,
        size: m.size,
        name: m.name,
        thumbnail: m.thumbnail,
        duration: m.duration,
        isImage: m.type?.startsWith('image/'),
        isVideo: m.type?.startsWith('video/'),
        isAudio: m.type?.startsWith('audio/'),
        isDocument: !['image/', 'video/', 'audio/'].some(t => m.type?.startsWith(t))
      });
    });
  }
  
  return media;
}

/**
 * Formate la réponse à un message
 */
export function formatReplyTo(replyData) {
  if (!replyData) return null;
  
  // Si c'est juste un ID
  if (typeof replyData === 'string') {
    return { id: replyData };
  }
  
  return {
    id: replyData.id,
    text: replyData.content || replyData.text || '',
    content: replyData.content || replyData.text || '',
    sender: replyData.sender?.name || 'Utilisateur',
    senderName: replyData.sender?.name || 'Utilisateur',
    type: replyData.message_type || replyData.type || 'text',
    timestamp: replyData.created_at,
    
    // Support des médias dans les réponses
    media: formatMedia(replyData),
    hasMedia: Boolean(replyData.media_url || replyData.media?.length),
    mediaUrl: replyData.media_url,
    mediaType: replyData.media_type,
    mediaName: replyData.media_name,
    thumbnailUrl: replyData.thumbnail_url
  };
}

/**
 * Génère un avatar par défaut basé sur le nom
 */
export function generateDefaultAvatar(name) {
  if (!name) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  
  // Générer une couleur basée sur le nom
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[index].substring(1)}&color=fff&size=150`;
}

/**
 * Formate l'heure d'affichage
 */
export function formatDisplayTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Paris' // Toujours afficher l'heure française réelle
    });
  } catch (error) {
    return '';
  }
}

/**
 * Formate l'heure relative (il y a X minutes)
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    return '';
  }
}

/**
 * Formate l'heure pour les messages (compatible avec le code existant)
 */
export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) {
      // Moins de 24h : afficher l'heure réelle d'envoi
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Paris' // Heure française
      });
    } else if (diffDays < 7) {
      // Moins d'une semaine : afficher le jour avec l'heure
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Paris'
      });
    } else {
      // Plus d'une semaine : afficher la date avec l'heure
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Paris'
      });
    }
  } catch (error) {
    return '';
  }
}

/**
 * Détecte les liens dans le texte
 */
export function detectLinks(text) {
  if (!text) return false;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}

/**
 * Détecte si le message ne contient que des emojis
 */
export function detectEmojiOnly(text) {
  if (!text) return false;
  const emojiRegex = /^[\p{Emoji}\s]+$/u;
  return emojiRegex.test(text.trim());
}

/**
 * Détecte si le message ne contient qu'un seul emoji
 */
export function detectSingleEmoji(text) {
  if (!text) return false;
  const trimmed = text.trim();
  const emojiRegex = /^\p{Emoji}$/u;
  return emojiRegex.test(trimmed);
}

/**
 * Formate un message pour l'envoi vers l'API
 */
export function formatMessageForAPI(messageData, currentUserId) {
  return {
    content: messageData.text || messageData.content || '',
    message_type: messageData.type || 'text',
    sender_id: currentUserId,
    reply_to_id: messageData.replyTo?.id || null,
    mentions: messageData.mentions || [],
    metadata: messageData.metadata || {},
    location: messageData.location || null
  };
}

/**
 * Transforme les réactions du format JSONB vers Array
 */
export function transformReactions(reactions) {
  if (!reactions) return [];
  
  // Si c'est déjà un array
  if (Array.isArray(reactions)) {
    return reactions.map(r => ({
      emoji: r.emoji,
      users: r.users || [],
      count: r.users?.length || 0
    }));
  }
  
  // Si c'est un objet JSONB
  if (typeof reactions === 'object') {
    return Object.entries(reactions).map(([emoji, users]) => ({
      emoji,
      users: Array.isArray(users) ? users : [],
      count: Array.isArray(users) ? users.length : 0
    }));
  }
  
  return [];
}

export default {
  formatMessageForUI,
  formatReactions,
  formatMedia,
  formatReplyTo,
  generateDefaultAvatar,
  formatDisplayTime,
  formatRelativeTime,
  formatMessageTime,
  detectLinks,
  detectEmojiOnly,
  detectSingleEmoji,
  formatMessageForAPI,
  transformReactions
};
