import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/Context/AuthContext';
import chatService from '../lib/chatService';
import { useSocket } from './useSocket';

// Hook pour intégrer le nouveau backend de chat
export const useChatBackend = () => {
  const { user, isAuthenticated } = useAuth();
  const { connect, disconnect, isConnected } = useSocket();
  
  // États
  const [discussions, setDiscussions] = useState([]);
  const [messages, setMessages] = useState(new Map()); // Map par discussionId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // États temps réel
  const [typingUsers, setTypingUsers] = useState(new Map()); // Map par discussionId
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Refs pour éviter les re-renders
  const cleanupFunctions = useRef([]);

  // Initialisation
  useEffect(() => {
    if (isAuthenticated && user && !initialized) {
      initializeBackend();
    } else if (!isAuthenticated && initialized) {
      cleanup();
    }

    return () => cleanup();
  }, [isAuthenticated, user, initialized]);

  // Initialiser le backend
  const initializeBackend = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialiser le service de chat
      const result = await chatService.initialize();
      
      if (!result.success) {
        throw new Error('Erreur initialisation du service de chat');
      }

      // Charger les discussions initiales
      await loadDiscussions();

      // Configurer les écouteurs
      setupEventListeners();

      setInitialized(true);
      console.log('✅ Backend de chat initialisé');
    } catch (err) {
      console.error('❌ Erreur initialisation backend:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les discussions
  const loadDiscussions = async () => {
    try {
      const result = await chatService.getDiscussions();
      
      if (result.success) {
        setDiscussions(result.data || []);
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erreur chargement discussions');
      }
    } catch (err) {
      console.error('Erreur chargement discussions:', err);
      setError(err.message);
      return [];
    }
  };

  // Charger les messages d'une discussion
  const loadMessages = async (discussionId, options = {}) => {
    try {
      const result = await chatService.getMessages(discussionId, options);
      
      if (result.success) {
        setMessages(prev => {
          const newMap = new Map(prev);
          const existingMessages = newMap.get(discussionId) || [];
          
          if (options.offset > 0) {
            // Pagination - ajouter au début
            newMap.set(discussionId, [...result.data, ...existingMessages]);
          } else {
            // Nouveau chargement
            newMap.set(discussionId, result.data || []);
          }
          
          return newMap;
        });
        
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erreur chargement messages');
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError(err.message);
      return [];
    }
  };

  // Envoyer un message
  const sendMessage = async (discussionId, content, options = {}) => {
    try {
      const result = await chatService.sendMessage(discussionId, content, options);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error?.message || 'Erreur envoi message');
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err.message);
      return { success: false, error: err };
    }
  };

  // Créer une discussion
  const createDiscussion = async (participantIds, name = null) => {
    try {
      const result = await chatService.createDiscussion(participantIds, name);
      
      if (result.success) {
        // Ajouter à la liste locale
        setDiscussions(prev => [result.data, ...prev]);
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Erreur création discussion');
      }
    } catch (err) {
      console.error('Erreur création discussion:', err);
      setError(err.message);
      return null;
    }
  };

  // Configurer les écouteurs d'événements
  const setupEventListeners = () => {
    // Nouveaux messages
    const cleanup1 = chatService.on('new_message', ({ discussionId, message }) => {
      setMessages(prev => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(discussionId) || [];
        newMap.set(discussionId, [...existingMessages, message]);
        return newMap;
      });

      // Mettre à jour la discussion (dernier message, timestamp)
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, lastMessage: message.text, lastMessageTime: message.timestamp }
          : d
      ));
    });

    // Messages temporaires (envoi en cours)
    const cleanup2 = chatService.on('message_temp', ({ discussionId, message }) => {
      setMessages(prev => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(discussionId) || [];
        newMap.set(discussionId, [...existingMessages, message]);
        return newMap;
      });
    });

    // Confirmation d'envoi
    const cleanup3 = chatService.on('message_confirmed', ({ tempId, message }) => {
      setMessages(prev => {
        const newMap = new Map(prev);
        
        // Remplacer le message temporaire par le message confirmé
        for (const [discussionId, msgs] of newMap.entries()) {
          const tempIndex = msgs.findIndex(m => m.id === tempId);
          if (tempIndex !== -1) {
            const newMessages = [...msgs];
            newMessages[tempIndex] = message;
            newMap.set(discussionId, newMessages);
            break;
          }
        }
        
        return newMap;
      });
    });

    // Utilisateurs en train de taper
    const cleanup4 = chatService.on('user_typing', ({ discussionId, userId, userName, isTyping }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const discussionTyping = newMap.get(discussionId) || new Map();
        
        if (isTyping) {
          discussionTyping.set(userId, userName);
        } else {
          discussionTyping.delete(userId);
        }
        
        if (discussionTyping.size === 0) {
          newMap.delete(discussionId);
        } else {
          newMap.set(discussionId, discussionTyping);
        }
        
        return newMap;
      });
    });

    // Statut utilisateur changé
    const cleanup5 = chatService.on('user_status_changed', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      // Mettre à jour les discussions
      setDiscussions(prev => prev.map(d => {
        if (d.participants?.some(p => p.id === userId)) {
          return { ...d, isOnline };
        }
        return d;
      }));
    });

    // Stocker les fonctions de nettoyage
    cleanupFunctions.current = [cleanup1, cleanup2, cleanup3, cleanup4, cleanup5];
  };

  // Fonctions utilitaires
  const joinDiscussion = (discussionId) => {
    chatService.joinDiscussion(discussionId);
  };

  const leaveDiscussion = (discussionId) => {
    chatService.leaveDiscussion(discussionId);
  };

  const startTyping = (discussionId) => {
    chatService.startTyping(discussionId);
  };

  const stopTyping = (discussionId) => {
    chatService.stopTyping(discussionId);
  };

  const markAsRead = async (discussionId) => {
    return await chatService.markAsRead(discussionId);
  };

  const editMessage = async (messageId, content) => {
    return await chatService.editMessage(messageId, content);
  };

  const deleteMessage = async (messageId) => {
    return await chatService.deleteMessage(messageId);
  };

  const addReaction = async (messageId, emoji) => {
    return await chatService.addReaction(messageId, emoji);
  };

  const removeReaction = async (messageId, emoji) => {
    return await chatService.removeReaction(messageId, emoji);
  };

  // Nettoyer les ressources
  const cleanup = () => {
    cleanupFunctions.current.forEach(cleanup => cleanup());
    cleanupFunctions.current = [];
    
    chatService.disconnect();
    setInitialized(false);
    setDiscussions([]);
    setMessages(new Map());
    setTypingUsers(new Map());
    setOnlineUsers(new Set());
  };

  // Reconnecter
  const reconnect = async () => {
    return await chatService.reconnect();
  };

  // Obtenir les messages d'une discussion
  const getDiscussionMessages = (discussionId) => {
    return messages.get(discussionId) || [];
  };

  // Obtenir les utilisateurs en train de taper dans une discussion
  const getTypingUsers = (discussionId) => {
    const discussionTyping = typingUsers.get(discussionId) || new Map();
    return Array.from(discussionTyping.values());
  };

  // Vérifier si un utilisateur est en ligne
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return {
    // États
    discussions,
    messages: getDiscussionMessages,
    loading,
    error,
    initialized,
    isConnected,

    // Actions
    loadDiscussions,
    loadMessages,
    sendMessage,
    createDiscussion,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,

    // Interactions temps réel
    joinDiscussion,
    leaveDiscussion,
    startTyping,
    stopTyping,
    getTypingUsers,
    isUserOnline,

    // Utilitaires
    reconnect,
    cleanup,

    // Backend service direct (pour des utilisations avancées)
    chatService
  };
};
