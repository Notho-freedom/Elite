import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import useSound from 'use-sound';
import { useAuth } from '../components/Context/AuthContext';
import { useApp } from '../components/Context/AppContext';
import chatService from '../services/chatService';
import { askGroq } from '../components/IA/AIResponse';
import { createEliteDemoMessagesForContact } from '../components/Enhanced/EliteDataEnricher';

// Configuration des sons
const SOUNDS = {
  SEND: '/Sounds/pop.mp3',
  RECEIVE: '/Sounds/recieve.mp3',
  TYPING: '/Sounds/typing.mp3',
  NOTIFICATION: '/Sounds/notification.mp3'
};

// Clés de stockage local
const STORAGE_KEYS = {
  SOUNDS_ENABLED: 'elite_chat_sounds',
  AI_ENABLED: 'elite_ai_enabled',
  AUTO_REPLY_DELAY: 'elite_auto_reply_delay',
  DRAFTS: 'elite_chat_drafts'
};

const useChatMessages = () => {
  const { user, isAuthenticated } = useAuth();
  const { activeChat } = useApp();

  // État principal
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Interface utilisateur
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fonctionnalités avancées
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showMessageActions, setShowMessageActions] = useState(false);

  // Indicateurs temps réel
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Paramètres utilisateur
  const [soundEnabled, setSoundEnabled] = useLocalStorage(STORAGE_KEYS.SOUNDS_ENABLED, true);
  const [aiEnabled, setAiEnabled] = useLocalStorage(STORAGE_KEYS.AI_ENABLED, true);
  const [autoReplyDelay, setAutoReplyDelay] = useLocalStorage(STORAGE_KEYS.AUTO_REPLY_DELAY, 2000);
  const [drafts, setDrafts] = useLocalStorage(STORAGE_KEYS.DRAFTS, {});

  // Sons
  const [playSendSound] = useSound(SOUNDS.SEND, { volume: soundEnabled ? 0.5 : 0 });
  const [playReceiveSound] = useSound(SOUNDS.RECEIVE, { volume: soundEnabled ? 0.3 : 0 });
  const [playTypingSound] = useSound(SOUNDS.TYPING, { volume: soundEnabled ? 0.2 : 0 });
  const [playNotificationSound] = useSound(SOUNDS.NOTIFICATION, { volume: soundEnabled ? 0.4 : 0 });

  // Références
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const lastMessageIdRef = useRef(null);

  // ID de la discussion courante
  const discussionId = activeChat?.discussion_id || activeChat?.id;
  const currentUserId = user?.id;

  // Messages filtrés pour la recherche
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(message => 
      message.content?.toLowerCase().includes(query) ||
      message.senderName?.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  // Messages épinglés
  const pinnedMessages = useMemo(() => 
    messages.filter(msg => msg.is_pinned), 
    [messages]
  );

  // Messages importants
  const importantMessages = useMemo(() => 
    messages.filter(msg => msg.is_important), 
    [messages]
  );

  /**
   * Charger les messages d'une discussion
   */
  const loadMessages = useCallback(async (discussionId, before = null, append = false) => {
    if (!discussionId || !currentUserId || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement messages pour discussion:', discussionId);

      if (isAuthenticated) {
        // Mode Supabase - utiliser le service
        const result = await chatService.loadMessages(discussionId, currentUserId, 50, before);

        if (result.success) {
          if (append) {
            setMessages(prev => [...result.data, ...prev]);
          } else {
            setMessages(result.data);
          }
          setHasMore(result.hasMore);
          
          // Marquer comme lu après chargement
          await chatService.markMessagesAsRead(discussionId, currentUserId);
        } else {
          setError(result.error);
          console.error('❌ Erreur chargement messages:', result.error);
        }
      } else {
        // Mode démonstration - utiliser les messages de démo
        if (!append) {
          const demoMessages = createEliteDemoMessagesForContact(discussionId, activeChat?.name || 'Contact');
          const formattedDemoMessages = demoMessages.map(msg => ({
            ...msg,
            id: msg.id || Date.now() + Math.random(),
            time: new Date(msg.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: msg.sender === 'me' ? 'read' : 'delivered',
            isOwn: msg.sender === 'me',
            reactions: msg.reactions || [],
            is_pinned: msg.isPinned || false,
            is_important: msg.isImportant || false
          }));
          setMessages(formattedDemoMessages);
          setHasMore(false);
        }
      }

    } catch (error) {
      console.error('❌ Erreur dans loadMessages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [discussionId, currentUserId, isAuthenticated, activeChat?.name]);

  /**
   * Charger plus de messages (pagination)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !messages.length || loadingRef.current) return;

    const oldestMessage = messages[0];
    if (oldestMessage?.id) {
      await loadMessages(discussionId, oldestMessage.id, true);
    }
  }, [discussionId, messages, hasMore, loadMessages]);

  /**
   * Envoyer un message
   */
  const sendMessage = useCallback(async (content, options = {}) => {
    if (!content?.trim() || !discussionId || !currentUserId) return;

    try {
      console.log('🔄 Envoi message:', content.substring(0, 50));

      // Jouer le son d'envoi
      playSendSound();

      // Arrêter l'indicateur de frappe
      setIsTyping(false);
      if (isAuthenticated) {
        await chatService.updateTypingIndicator(discussionId, currentUserId, false);
      }

      if (isAuthenticated) {
        // Mode Supabase
        const messageData = {
          discussion_id: discussionId,
          sender_id: currentUserId,
          content: content.trim(),
          message_type: options.type || 'text',
          media_url: options.media_url,
          media_type: options.media_type,
          media_size: options.media_size,
          media_name: options.media_name,
          thumbnail_url: options.thumbnail_url,
          reply_to_id: replyingTo?.id,
          mentions: options.mentions || [],
          metadata: options.metadata || {},
          location: options.location
        };

        const result = await chatService.sendMessage(messageData);

        if (result.success) {
          // Le message sera ajouté via l'abonnement temps réel
          // ou on peut l'ajouter directement pour une UX plus rapide
          setMessages(prev => [...prev, result.data]);
          
          // Nettoyer l'état
          setInputValue('');
          setReplyingTo(null);
          
          // Sauvegarder le brouillon vide
          setDrafts(prev => ({
            ...prev,
            [discussionId]: ''
          }));

          console.log('✅ Message envoyé avec succès');
        } else {
          console.error('❌ Erreur envoi message:', result.error);
          setError(result.error);
        }
      } else {
        // Mode démonstration
        const newMessage = {
          id: Date.now() + Math.random(),
          content: content.trim(),
          text: content.trim(),
          sender: 'me',
          senderId: 'demo-user',
          senderName: 'Vous',
          isOwn: true,
          type: options.type || 'text',
          status: 'sent',
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: new Date().toISOString(),
          is_edited: false,
          is_pinned: false,
          is_important: false,
          reactions: [],
          mentions: options.mentions || [],
          metadata: options.metadata || {},
          reply_to: replyingTo ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender: replyingTo.senderName
          } : null,
          ...options
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setReplyingTo(null);

        // Réponse IA automatique en mode démo
        if (aiEnabled && !content.trim().startsWith('/')) {
          setTimeout(async () => {
            try {
              const aiResponse = await askGroq(content, { 
                userName: activeChat?.name || 'Contact',
                isDemo: true 
              });

              if (aiResponse) {
                playReceiveSound();
                const aiMessage = {
                  id: Date.now() + Math.random(),
                  content: aiResponse,
                  text: aiResponse,
                  sender: activeChat?.name || 'IA',
                  senderId: activeChat?.id || 'ai',
                  senderName: activeChat?.name || 'Assistant IA',
                  avatar: activeChat?.avatar,
                  isOwn: false,
                  type: 'text',
                  status: 'delivered',
                  timestamp: new Date().toISOString(),
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  created_at: new Date().toISOString(),
                  is_edited: false,
                  reactions: [],
                  metadata: { isAI: true }
                };

                setMessages(prev => [...prev, aiMessage]);
              }
            } catch (error) {
              console.error('❌ Erreur réponse IA:', error);
            }
          }, autoReplyDelay);
        }
      }

    } catch (error) {
      console.error('❌ Erreur dans sendMessage:', error);
      setError(error.message);
    }
  }, [
    discussionId, 
    currentUserId, 
    isAuthenticated, 
    replyingTo, 
    aiEnabled, 
    autoReplyDelay, 
    activeChat,
    playSendSound,
    playReceiveSound
  ]);

  /**
   * Modifier un message
   */
  const editMessage = useCallback(async (messageId, newContent) => {
    if (!messageId || !newContent?.trim() || !currentUserId) return;

    try {
      if (isAuthenticated) {
        const result = await chatService.editMessage(messageId, newContent, currentUserId);
        
        if (result.success) {
          // Mettre à jour le message localement
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: newContent, text: newContent, is_edited: true }
              : msg
          ));
          setEditingMessage(null);
          console.log('✅ Message modifié');
        } else {
          setError(result.error);
        }
      } else {
        // Mode démo
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent, text: newContent, is_edited: true }
            : msg
        ));
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('❌ Erreur modification message:', error);
      setError(error.message);
    }
  }, [currentUserId, isAuthenticated]);

  /**
   * Supprimer un message
   */
  const deleteMessage = useCallback(async (messageId) => {
    if (!messageId || !currentUserId) return;

    try {
      if (isAuthenticated) {
        const result = await chatService.deleteMessage(messageId, currentUserId);
        
        if (result.success) {
          // Supprimer le message localement
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
          console.log('✅ Message supprimé');
        } else {
          setError(result.error);
        }
      } else {
        // Mode démo
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('❌ Erreur suppression message:', error);
      setError(error.message);
    }
  }, [currentUserId, isAuthenticated]);

  /**
   * Ajouter une réaction
   */
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji || !currentUserId) return;

    try {
      if (isAuthenticated) {
        const result = await chatService.addReaction(messageId, currentUserId, emoji);
        
        if (result.success) {
          // La mise à jour sera gérée par l'abonnement temps réel
          // ou on peut mettre à jour localement pour une UX plus rapide
          console.log('✅ Réaction ajoutée/supprimée');
        } else {
          setError(result.error);
        }
      } else {
        // Mode démo - mise à jour locale
        setMessages(prev => prev.map(msg => {
          if (msg.id !== messageId) return msg;

          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.emoji === emoji);

          if (existingReaction) {
            // Supprimer la réaction
            const hasUserReaction = existingReaction.userIds?.includes(currentUserId);
            if (hasUserReaction) {
              existingReaction.count = Math.max(0, existingReaction.count - 1);
              existingReaction.userIds = existingReaction.userIds.filter(id => id !== currentUserId);
              existingReaction.users = existingReaction.users.filter(u => u.id !== currentUserId);
              
              if (existingReaction.count === 0) {
                return {
                  ...msg,
                  reactions: reactions.filter(r => r.emoji !== emoji)
                };
              }
            }
          } else {
            // Ajouter la réaction
            reactions.push({
              emoji,
              count: 1,
              userIds: [currentUserId],
              users: [{ id: currentUserId, name: 'Vous' }]
            });
          }

          return { ...msg, reactions: [...reactions] };
        }));
      }
    } catch (error) {
      console.error('❌ Erreur réaction:', error);
      setError(error.message);
    }
  }, [currentUserId, isAuthenticated]);

  /**
   * Gérer l'indicateur de frappe
   */
  const handleTyping = useCallback(async (typing) => {
    if (!discussionId || !currentUserId || !isAuthenticated) return;

    try {
      setIsTyping(typing);
      await chatService.updateTypingIndicator(discussionId, currentUserId, typing);

      if (typing) {
        playTypingSound();
        
        // Auto-arrêt après 3 secondes d'inactivité
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 3000);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error('❌ Erreur indicateur frappe:', error);
    }
  }, [discussionId, currentUserId, isAuthenticated, playTypingSound]);

  /**
   * Gérer les brouillons
   */
  const updateDraft = useCallback((value) => {
    if (!discussionId) return;
    
    setInputValue(value);
    setDrafts(prev => ({
      ...prev,
      [discussionId]: value
    }));

    // Indicateur de frappe
    if (value.trim() && !isTyping) {
      handleTyping(true);
    } else if (!value.trim() && isTyping) {
      handleTyping(false);
    }
  }, [discussionId, isTyping, handleTyping]);

  /**
   * Faire défiler vers le bas
   */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'instant' 
    });
  }, []);

  // Charger les messages quand la discussion change
  useEffect(() => {
    if (discussionId && currentUserId) {
      setMessages([]);
      setError(null);
      setHasMore(true);
      loadMessages(discussionId);
      
      // Charger le brouillon
      const draft = drafts[discussionId] || '';
      setInputValue(draft);
    }
  }, [discussionId, currentUserId, loadMessages, drafts]);

  // Abonnement temps réel
  useEffect(() => {
    if (!discussionId || !currentUserId || !isAuthenticated) return;

    console.log('🔄 Activation abonnement temps réel pour:', discussionId);

    const callbacks = {
      onNewMessage: (message) => {
        console.log('📨 Nouveau message reçu:', message.id);
        
        // Éviter les doublons
        setMessages(prev => {
          const exists = prev.find(m => m.id === message.id);
          if (exists) return prev;
          
          // Jouer le son si ce n'est pas notre message
          if (!message.isOwn) {
            playReceiveSound();
            playNotificationSound();
          }
          
          return [...prev, message];
        });

        // Auto-scroll si on est en bas
        setTimeout(scrollToBottom, 100);
      },

      onMessageUpdate: (updatedMessage) => {
        console.log('📝 Message mis à jour:', updatedMessage.id);
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id 
            ? { ...msg, ...updatedMessage }
            : msg
        ));
      },

      onTypingUpdate: (typingUsers) => {
        console.log('⌨️ Utilisateurs en train de taper:', typingUsers.length);
        setTypingUsers(typingUsers.filter(u => u.user_id !== currentUserId));
      },

      onReactionUpdate: (reactionData) => {
        console.log('😊 Réaction mise à jour');
        // Recharger les réactions pour ce message
        // ou mettre à jour localement selon le payload
      }
    };

    chatService.subscribeToDiscussion(discussionId, currentUserId, callbacks);

    return () => {
      chatService.unsubscribeFromDiscussion(discussionId);
    };
  }, [discussionId, currentUserId, isAuthenticated, playReceiveSound, playNotificationSound, scrollToBottom]);

  // Auto-scroll sur nouveaux messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMessage.id;
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages, scrollToBottom]);

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      chatService.cleanup();
    };
  }, []);

  return {
    // Messages
    messages,
    filteredMessages,
    pinnedMessages,
    importantMessages,
    loading,
    error,
    hasMore,

    // Interface
    inputValue,
    isTyping,
    showEmojiPicker,
    showSearch,
    searchQuery,
    typingUsers,

    // Actions sur messages
    replyingTo,
    editingMessage,
    selectedMessages,
    showMessageActions,

    // Paramètres
    soundEnabled,
    aiEnabled,
    autoReplyDelay,

    // Fonctions
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMoreMessages,
    scrollToBottom,

    // Setters interface
    setInputValue: updateDraft,
    setShowEmojiPicker,
    setShowSearch,
    setSearchQuery,
    setReplyingTo,
    setEditingMessage,
    setSelectedMessages,
    setShowMessageActions,

    // Setters paramètres
    setSoundEnabled,
    setAiEnabled,
    setAutoReplyDelay,

    // Références
    messagesEndRef,
    inputRef,

    // Utilitaires
    clearError: () => setError(null),
    refreshMessages: () => loadMessages(discussionId)
  };
};

export default useChatMessages;
