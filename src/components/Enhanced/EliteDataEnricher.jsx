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

// Fonction pour créer des messages de démonstration variés selon le contact
export const createEliteDemoMessagesForContact = (contactId, contactName) => {
  const now = Date.now();
  
  // Messages différents selon le contact
  const messageTemplates = {
    '1': [ // Sarah Johnson
      {
        id: '1',
        text: 'Salut ! Comment ça va ? 😊',
        sender: 'them',
        timestamp: new Date(now - 3600000).toISOString(),
        reactions: [{ emoji: '👋', count: 1, users: ['me'] }]
      },
      {
        id: '2',
        text: 'Très bien merci ! Et toi ? Comment se passe ton projet Elite ?',
        sender: 'me',
        timestamp: new Date(now - 3000000).toISOString()
      },
      {
        id: '3',
        text: 'Parfait ! Le système de chat avec IA fonctionne super bien ! 🚀\nTu veux tester les nouvelles fonctionnalités ?',
        sender: 'them',
        timestamp: new Date(now - 2400000).toISOString(),
        reactions: [
          { emoji: '🤩', count: 1, users: ['me'] },
          { emoji: '🔥', count: 1, users: ['me'] }
        ]
      },
      {
        id: '4',
        text: 'Oui, avec plaisir ! J\'ai vu que vous avez ajouté les réactions emoji 😊',
        sender: 'me',
        timestamp: new Date(now - 1800000).toISOString()
      },
      {
        id: '5',
        text: 'Exactement ! Et aussi les messages épinglés, les réponses en fil, l\'édition...',
        sender: 'them',
        timestamp: new Date(now - 1500000).toISOString(),
        isPinned: true
      }
    ],
    
    '2': [ // Équipe Développement
      {
        id: '1',
        text: '🎉 Nouvelle fonctionnalité déployée !',
        sender: 'them',
        timestamp: new Date(now - 1800000).toISOString(),
        isImportant: true
      },
      {
        id: '2',
        text: 'Super ! Quoi de neuf ?',
        sender: 'me',
        timestamp: new Date(now - 1700000).toISOString()
      },
      {
        id: '3',
        text: 'Système de chat avec IA intégrée ✨\n- Réponses automatiques\n- Personnalité adaptive\n- Mode démo complet',
        sender: 'them',
        timestamp: new Date(now - 1600000).toISOString(),
        isPinned: true
      },
      {
        id: '4',
        text: 'Wow ! Ça a l\'air incroyable ! 🤖',
        sender: 'me',
        timestamp: new Date(now - 1500000).toISOString(),
        reactions: [{ emoji: '🚀', count: 3, users: ['user1', 'user2', 'me'] }]
      },
      {
        id: '5',
        text: 'On a aussi ajouté la synchronisation temps réel et les paramètres avancés !',
        sender: 'them',
        timestamp: new Date(now - 1200000).toISOString()
      }
    ],
    
    '3': [ // Mike Chen
      {
        id: '1',
        text: 'Hey ! Tu as vu la nouvelle démo Elite ? 🔥',
        sender: 'them',
        timestamp: new Date(now - 2400000).toISOString()
      },
      {
        id: '2',
        text: 'Pas encore ! Dis-moi tout !',
        sender: 'me',
        timestamp: new Date(now - 2300000).toISOString()
      },
      {
        id: '3',
        text: 'IA conversationnelle intégrée, interface moderne, fonctionnalités avancées... 🚀',
        sender: 'them',
        timestamp: new Date(now - 2200000).toISOString(),
        isImportant: true
      },
      {
        id: '4',
        text: 'https://elite-technologies.com/demo\nRegarde ça !',
        sender: 'them',
        timestamp: new Date(now - 2000000).toISOString(),
        hasLinks: true
      },
      {
        id: '5',
        text: 'Impressionnant ! 🤩 On se voit demain pour en discuter ?',
        sender: 'me',
        timestamp: new Date(now - 1800000).toISOString(),
        replyTo: '4'
      },
      {
        id: '6',
        text: 'Parfait ! 14h au bureau ? ☕',
        sender: 'them',
        timestamp: new Date(now - 900000).toISOString(),
        reactions: [{ emoji: '👍', count: 1, users: ['me'] }]
      }
    ],
    
    '4': [ // Annonces Elite
      {
        id: '1',
        text: '🚀 NOUVEAUTÉ ELITE CHAT 🚀\n\nDécouvrez notre système de messagerie révolutionnaire !',
        sender: 'them',
        timestamp: new Date(now - 7200000).toISOString(),
        isImportant: true,
        isPinned: true
      },
      {
        id: '2',
        text: '✨ Fonctionnalités highlights :\n• IA conversationnelle\n• Interface moderne\n• Synchronisation temps réel\n• Réactions & réponses\n• Messages épinglés',
        sender: 'them',
        timestamp: new Date(now - 7000000).toISOString()
      },
      {
        id: '3',
        text: '💰 Nouvelle fonctionnalité de monétisation disponible pour les utilisateurs Elite !',
        sender: 'them',
        timestamp: new Date(now - 3600000).toISOString(),
        reactions: [
          { emoji: '💰', count: 12, users: ['user1', 'user2', 'user3'] },
          { emoji: '🔥', count: 8, users: ['user4', 'user5'] }
        ]
      },
      {
        id: '4',
        text: '📊 Statistiques de performance :\n• +300% d\'engagement\n• +250% de temps passé\n• +400% de satisfaction utilisateur',
        sender: 'them',
        timestamp: new Date(now - 1800000).toISOString(),
        isImportant: true
      }
    ],
    
    '5': [ // Emma Wilson
      {
        id: '1',
        text: 'Merci pour votre aide avec le projet ! 🙏',
        sender: 'them',
        timestamp: new Date(now - 1200000).toISOString()
      },
      {
        id: '2',
        text: 'Avec plaisir ! Comment ça avance ?',
        sender: 'me',
        timestamp: new Date(now - 1100000).toISOString()
      },
      {
        id: '3',
        text: 'Super bien ! L\'IA répond parfaitement, c\'est exactement ce qu\'on voulait ! ✨',
        sender: 'them',
        timestamp: new Date(now - 1000000).toISOString(),
        reactions: [{ emoji: '🎯', count: 1, users: ['me'] }]
      },
      {
        id: '4',
        text: 'Génial ! Tu as testé toutes les fonctionnalités ?',
        sender: 'me',
        timestamp: new Date(now - 900000).toISOString()
      },
      {
        id: '5',
        text: 'Oui ! Les réactions, les réponses, l\'édition... Tout fonctionne parfaitement ! 🚀',
        sender: 'them',
        timestamp: new Date(now - 600000).toISOString(),
        isImportant: true
      },
      {
        id: '6',
        text: 'Parfait ! On va pouvoir présenter ça en confiance ! 💪',
        sender: 'me',
        timestamp: new Date(now - 300000).toISOString()
      }
    ]
  };
  
  // Récupérer les messages pour ce contact ou utiliser des messages par défaut
  const templates = messageTemplates[contactId] || messageTemplates['1'];
  
  // Générer les messages avec les bonnes propriétés
  return templates.map(template => ({
    ...template,
    senderId: template.sender === 'them' ? contactId : 'me',
    isRead: template.sender === 'them' ? true : template.isRead !== false,
    type: template.type || 'text',
    avatar: template.sender === 'them' 
      ? `https://images.unsplash.com/photo-${1400000000000 + parseInt(contactId) * 100000000}?w=150&h=150&fit=crop&crop=face`
      : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    reactions: template.reactions || [],
    isPinned: template.isPinned || false,
    isImportant: template.isImportant || false,
    mentions: template.mentions || [],
    hasLinks: template.hasLinks || false,
    replyTo: template.replyTo || null
  }));
};

// Fonction pour créer des messages de démonstration Elite (compatibilité)
export const createEliteDemoMessages = () => {
  return createEliteDemoMessagesForContact('1', 'Sarah Johnson');
};

// Composant de démonstration (optionnel)
const EliteDataEnricher = () => {
  return null; // Ce composant n'a pas d'interface utilisateur
};

export default EliteDataEnricher;


export function normalizeMessage(raw) {
  let parsedContent = {};

  try {
    parsedContent = JSON.parse(raw.content || "{}");
  } catch (e) {
    console.error("Erreur parsing content", e, raw.content);
    parsedContent = { text: raw.content || "", media: [] };
  }

  return {
    id: raw.id,
    discussionId: raw.discussion_id,
    senderId: raw.senderId,
    sender: parsedContent.sender || null,
    text: parsedContent.text || "",
    media: Array.isArray(parsedContent.media) ? parsedContent.media : [],
    replyTo: parsedContent.replyTo || raw.reply_to_id || null,
    timestamp: parsedContent.timestamp || raw.created_at,
    isRead: parsedContent.isRead ?? false,
    isEdited: parsedContent.isEdited ?? false
  };
}
