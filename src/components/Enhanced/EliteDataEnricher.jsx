import React from 'react';

// Fonction pour enrichir les discussions avec les fonctionnalités Elite
export const enrichDiscussionsWithEliteFeatures = (discussions) => {
  return discussions.map((discussion, index) => {
    // Ajouter des propriétés Elite aléatoires
    const isPremium = Math.random() > 0.7;
    const isVerified = Math.random() > 0.8;
    const isElite = Math.random() > 0.9;
    const isPinned = Math.random() > 0.85;
    const isArchived = Math.random() > 0.9;
    const isLocked = Math.random() > 0.95;
    const isMuted = Math.random() > 0.8;
    const isFavorite = Math.random() > 0.75;
    
    // Types de discussion
    const types = ['direct', 'group', 'broadcast'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Statuts de message
    const messageStatuses = ['sent', 'delivered', 'read'];
    const lastMessageStatus = messageStatuses[Math.floor(Math.random() * messageStatuses.length)];
    
    // Types de contenu
    const hasVoiceMessage = Math.random() > 0.7;
    const hasMedia = Math.random() > 0.6;
    const hasLocation = Math.random() > 0.9;
    
    // Nombre de messages non lus
    const unreadCount = discussion.unread ? Math.floor(Math.random() * 10) + 1 : 0;
    
    return {
      ...discussion,
      // Propriétés Elite
      isPremium,
      isVerified,
      isElite,
      isPinned,
      isArchived,
      isLocked,
      isMuted,
      isFavorite,
      type,
      
      // Statuts et indicateurs
      lastMessageStatus,
      unreadCount,
      hasVoiceMessage,
      hasMedia,
      hasLocation,
      
      // Données enrichies
      lastMessageTime: discussion.lastMessageTime || discussion.time,
      participants: discussion.participants || [],
      
      // Métadonnées Elite
      eliteFeatures: {
        canMonetize: isElite,
        canCreateRooms: isPremium,
        canBroadcast: isVerified,
        canLockMessages: isElite,
        canPinMessages: isPremium,
        canArchive: true,
        canMute: true,
        canBlock: true,
        canReport: true,
        canExport: isPremium,
        canTransfer: isVerified,
      },
      
      // Statistiques (pour les utilisateurs Elite)
      stats: isElite ? {
        totalMessages: Math.floor(Math.random() * 1000) + 100,
        totalCalls: Math.floor(Math.random() * 50) + 10,
        totalViews: Math.floor(Math.random() * 5000) + 500,
        totalEarnings: Math.floor(Math.random() * 1000) + 100,
        followers: Math.floor(Math.random() * 500) + 50,
        following: Math.floor(Math.random() * 200) + 20,
      } : null,
      
      // Paramètres de confidentialité
      privacy: {
        showOnlineStatus: Math.random() > 0.3,
        showLastSeen: Math.random() > 0.4,
        showReadReceipts: Math.random() > 0.5,
        allowCalls: Math.random() > 0.2,
        allowMessages: true,
        allowGroups: Math.random() > 0.1,
      },
      
      // Paramètres de notification
      notifications: {
        messages: !isMuted,
        calls: !isMuted,
        groups: !isMuted,
        status: !isMuted,
        mentions: true,
        reactions: true,
        earnings: isElite,
      }
    };
  });
};

// Fonction pour enrichir les messages avec les fonctionnalités Elite
export const enrichMessagesWithEliteFeatures = (messages) => {
  return messages.map((message, index) => {
    // Types de message Elite
    const messageTypes = ['text', 'voice', 'image', 'video', 'document', 'location', 'sticker', 'gif'];
    const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    // États de message
    const isPinned = Math.random() > 0.9;
    const isFavorite = Math.random() > 0.85;
    const isLocked = Math.random() > 0.95;
    const isForwarded = Math.random() > 0.7;
    const isReplied = Math.random() > 0.6;
    const isEdited = Math.random() > 0.8;
    
    // Réactions
    const reactions = Math.random() > 0.5 ? [
      { emoji: '👍', count: Math.floor(Math.random() * 10) + 1, users: ['user1', 'user2'] },
      { emoji: '❤️', count: Math.floor(Math.random() * 5) + 1, users: ['user3'] },
      { emoji: '😂', count: Math.floor(Math.random() * 3) + 1, users: ['user4'] },
    ] : [];
    
    // Médias
    const media = type === 'image' || type === 'video' ? [
      {
        type: type,
        url: `https://picsum.photos/300/200?random=${index}`,
        thumbnail: `https://picsum.photos/100/100?random=${index}`,
        size: Math.floor(Math.random() * 5000000) + 100000,
        duration: type === 'video' ? Math.floor(Math.random() * 60) + 10 : null,
      }
    ] : [];
    
    // Message de réponse
    const replyTo = isReplied ? {
      id: `reply-${index}`,
      text: 'Message de réponse original',
      sender: 'other',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    } : null;
    
    return {
      ...message,
      // Propriétés Elite
      type,
      isPinned,
      isFavorite,
      isLocked,
      isForwarded,
      isReplied,
      isEdited,
      
      // Contenu enrichi
      reactions,
      media,
      replyTo,
      
      // Métadonnées
      metadata: {
        sentAt: message.timestamp,
        deliveredAt: new Date(new Date(message.timestamp).getTime() + 1000).toISOString(),
        readAt: new Date(new Date(message.timestamp).getTime() + 5000).toISOString(),
        editedAt: isEdited ? new Date(new Date(message.timestamp).getTime() + 300000).toISOString() : null,
        forwardedFrom: isForwarded ? {
          chatId: `chat-${Math.floor(Math.random() * 100)}`,
          chatName: `Chat ${Math.floor(Math.random() * 100)}`,
          messageId: `msg-${Math.floor(Math.random() * 1000)}`,
        } : null,
      },
      
      // Paramètres de confidentialité
      privacy: {
        canForward: Math.random() > 0.2,
        canCopy: Math.random() > 0.1,
        canEdit: message.sender === 'me' && Math.random() > 0.3,
        canDelete: message.sender === 'me' || Math.random() > 0.8,
        canPin: Math.random() > 0.5,
        canLock: Math.random() > 0.7,
        canReact: true,
        canReply: true,
      },
      
      // Statistiques (pour les messages publics/groupes)
      stats: type === 'image' || type === 'video' ? {
        views: Math.floor(Math.random() * 100) + 10,
        downloads: Math.floor(Math.random() * 20) + 1,
        shares: Math.floor(Math.random() * 10) + 1,
      } : null,
    };
  });
};

// Fonction pour créer des données de démonstration Elite
export const createEliteDemoData = () => {
  const demoDiscussions = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Salut ! Comment ça va ? 😊',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unread: true,
      isOnline: true,
      isPremium: true,
      isVerified: true,
      type: 'direct',
    },
    {
      id: '2',
      name: 'Équipe Développement',
      avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Nouvelle fonctionnalité déployée ! 🚀',
      lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
      unread: false,
      isOnline: false,
      isPinned: true,
      type: 'group',
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Voulez-vous qu\'on se voit demain ?',
      lastMessageTime: new Date(Date.now() - 900000).toISOString(),
      unread: true,
      isOnline: true,
      isElite: true,
      type: 'direct',
    },
    {
      id: '4',
      name: 'Annonces Elite',
      avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Nouvelle fonctionnalité de monétisation disponible ! 💰',
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      unread: false,
      isOnline: false,
      isArchived: true,
      type: 'broadcast',
    },
    {
      id: '5',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Merci pour votre aide ! 🙏',
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      unread: false,
      isOnline: false,
      isFavorite: true,
      type: 'direct',
    },
  ];

  return enrichDiscussionsWithEliteFeatures(demoDiscussions);
};

// Fonction pour créer des messages de démonstration Elite
export const createEliteDemoMessages = () => {
  const demoMessages = [
    {
      id: '1',
      text: 'Salut ! Comment ça va ? 😊',
      sender: 'other',
      senderId: 'other',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      type: 'text',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      text: 'Très bien merci ! Et toi ?',
      sender: 'me',
      senderId: 'me',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      isRead: true,
      type: 'text',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      text: 'Parfait ! On se voit bientôt ?',
      sender: 'other',
      senderId: 'other',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      isRead: true,
      type: 'text',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      text: 'Oui, avec plaisir ! 😊',
      sender: 'me',
      senderId: 'me',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
      type: 'text',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '5',
      text: 'Super ! À bientôt alors !',
      sender: 'other',
      senderId: 'other',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      isRead: false,
      type: 'text',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return enrichMessagesWithEliteFeatures(demoMessages);
};

// Composant de démonstration (optionnel)
const EliteDataEnricher = () => {
  return null; // Ce composant n'a pas d'interface utilisateur
};

export default EliteDataEnricher;


export function normalizeMessage(raw) {
  let parsedContent = {};

  // Gestion intelligente du contenu : JSON ou texte simple
  if (raw.content) {
    // Vérifier si c'est du JSON valide
    if (raw.content.trim().startsWith('{') && raw.content.trim().endsWith('}')) {
      try {
        parsedContent = JSON.parse(raw.content);
      } catch (e) {
        console.warn("Contenu JSON malformé, traitement comme texte:", raw.content);
        parsedContent = { text: raw.content, media: [] };
      }
    } else {
      // C'est du texte simple, pas du JSON
      parsedContent = { text: raw.content, media: [] };
    }
  } else {
    // Pas de contenu
    parsedContent = { text: "", media: [] };
  }

  // Gérer les médias depuis les champs de base de données
  const media = [];
  if (raw.media_url) {
    media.push({
      id: `media-${raw.id}`,
      url: raw.media_url,
      type: raw.message_type || 'file',
      mediaType: raw.media_type,
      size: raw.media_size,
      name: raw.media_name,
      thumbnail: raw.thumbnail_url
    });
  }

  return {
    id: raw.id,
    discussionId: raw.discussion_id,
    senderId: raw.sender_id || raw.senderId,
    sender: raw.sender?.name || parsedContent.sender || 'Utilisateur',
    senderName: raw.sender?.name || 'Utilisateur',
    avatar: raw.sender?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    
    // Contenu - support double format
    text: parsedContent.text || raw.content || "",
    content: parsedContent.text || raw.content || "",
    
    // Médias depuis la DB ou depuis le JSON
    media: media.length > 0 ? media : (Array.isArray(parsedContent.media) ? parsedContent.media : []),
    hasMedia: media.length > 0 || (parsedContent.media && parsedContent.media.length > 0),
    
    // Type et statut
    type: raw.message_type || 'text',
    messageType: raw.message_type || 'text',
    status: raw.status || 'sent',
    
    // Métadonnées
    replyTo: parsedContent.replyTo || raw.reply_to_id || null,
    timestamp: raw.created_at || parsedContent.timestamp,
    time: formatMessageTime(raw.created_at),
    createdAt: raw.created_at,
    
    // États
    isRead: parsedContent.isRead ?? (raw.status === 'read'),
    isEdited: parsedContent.isEdited ?? Boolean(raw.is_edited),
    isDeleted: Boolean(raw.is_deleted),
    isPinned: Boolean(raw.is_pinned),
    isImportant: Boolean(raw.is_important),
    
    // Réactions et interactions
    reactions: raw.reactions ? (Array.isArray(raw.reactions) ? raw.reactions : []) : [],
    mentions: raw.mentions ? (Array.isArray(raw.mentions) ? raw.mentions : []) : []
  };
}

// Fonction helper pour formater l'heure (si pas déjà importée)
function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    });
  } catch (error) {
    return '';
  }
}
