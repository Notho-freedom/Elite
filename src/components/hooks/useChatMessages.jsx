// hooks/useChatMessages.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useSound from 'use-sound';
import { useLocalStorage } from 'usehooks-ts';
import { askGroq, clearChatHistory } from '../IA/AIResponse';
import { useApp } from '../Context/AppContext';

// Configuration des sons
const SOUNDS = {
  SEND: '/Sounds/pop.mp3',
  RECEIVE: '/Sounds/recieve.mp3',
  TYPING: '/Sounds/typing.mp3',
  NOTIFICATION: '/Sounds/notification.mp3'
};

// Clé pour la persistance locale
const STORAGE_KEYS = {
  MESSAGES: 'elite_chat_messages',
  DRAFTS: 'elite_chat_drafts',
  AI_ENABLED: 'elite_ai_enabled',
  AUTO_REPLY_DELAY: 'elite_auto_reply_delay'
};

const useChatMessages = () => {
  // État principal
  const { activeChat, messages, setMessages } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('chatSoundsEnabled', true);
  
  // Nouvelles fonctionnalités
  const [persistedMessages, setPersistedMessages] = useLocalStorage(STORAGE_KEYS.MESSAGES, {});
  const [chatDrafts, setChatDrafts] = useLocalStorage(STORAGE_KEYS.DRAFTS, {});
  const [aiEnabled, setAiEnabled] = useLocalStorage(STORAGE_KEYS.AI_ENABLED, true);
  const [autoReplyDelay, setAutoReplyDelay] = useLocalStorage(STORAGE_KEYS.AUTO_REPLY_DELAY, 2000);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageActions, setMessageActions] = useState({});
  
  // Références
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const aiResponseTimeoutRef = useRef(null);
  
  // Sons
  const [playSendSound] = useSound(SOUNDS.SEND, { 
    volume: 0.3,
    soundEnabled,
    interrupt: true
  });
  
  const [playReceiveSound] = useSound(SOUNDS.RECEIVE, {
    volume: 0.6,
    soundEnabled,
    interrupt: true
  });

  const [playTypingSound, { stop: stopTypingSound }] = useSound(SOUNDS.TYPING, {
    volume: 0.2,
    soundEnabled,
    loop: true
  });

  const [playNotificationSound] = useSound(SOUNDS.NOTIFICATION, {
    volume: 0.4,
    soundEnabled
  });

  // Charger les messages persistés pour le chat actif
  useEffect(() => {
    if (activeChat?.id && persistedMessages[activeChat.id]) {
      setMessages(persistedMessages[activeChat.id]);
    }
  }, [activeChat?.id, persistedMessages, setMessages]);

  // Sauvegarder les messages dans le storage local
  useEffect(() => {
    if (activeChat?.id && messages.length > 0) {
      setPersistedMessages(prev => ({
        ...prev,
        [activeChat.id]: messages
      }));
    }
  }, [messages, activeChat?.id, setPersistedMessages]);

  // Gestion des brouillons
  useEffect(() => {
    if (activeChat?.id) {
      const draft = chatDrafts[activeChat.id];
      if (draft && !inputValue) {
        setInputValue(draft);
      }
    }
  }, [activeChat?.id, chatDrafts]);

  const saveDraft = useCallback((value) => {
    if (activeChat?.id) {
      setChatDrafts(prev => ({
        ...prev,
        [activeChat.id]: value || ''
      }));
    }
  }, [activeChat?.id, setChatDrafts]);

  // Gestion des réponses IA améliorée
  useEffect(() => {
    if (!aiEnabled) return;

    const handleAIResponse = async (lastMessage) => {
      try {
        // Simuler l'indicateur de frappe
        setIsTyping(true);
        if (soundEnabled) playTypingSound();
        
        const aiReply = await askGroq(lastMessage.text, activeChat);
        
        stopTypingSound();
        setIsTyping(false);

        const replyMessage = {
          id: `ai_${Date.now()}`,
          text: aiReply,
          sender: 'them',
          senderId: activeChat.id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          status: 'read',
          reactions: [],
          type: 'text',
          isAI: true,
          replyTo: lastMessage.id
        };

        setMessages(prev => [...prev, replyMessage]);
        if (soundEnabled) playReceiveSound();
        
        // Notification sonore pour indiquer une réponse IA
        setTimeout(() => {
          if (soundEnabled) playNotificationSound();
        }, 500);

      } catch (err) {
        console.error('Erreur réponse IA:', err);
        stopTypingSound();
        setIsTyping(false);
        
        // Message d'erreur sympathique
        const errorMessage = {
          id: `error_${Date.now()}`,
          text: "Oups, j'ai eu un petit souci ! 😅 Peux-tu réessayer ?",
          sender: 'them',
          senderId: activeChat.id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          status: 'read',
          reactions: [],
          type: 'text',
          isAI: true,
          isError: true
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    };

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.sender === 'me' && lastMessage?.text && activeChat?.isOnline && !lastMessage.isEdited) {
      // Nettoyer les timeouts précédents
      if (aiResponseTimeoutRef.current) {
        clearTimeout(aiResponseTimeoutRef.current);
      }

      aiResponseTimeoutRef.current = setTimeout(() => {
        handleAIResponse(lastMessage);
      }, autoReplyDelay + Math.random() * 1000);
    }

    return () => {
      if (aiResponseTimeoutRef.current) {
        clearTimeout(aiResponseTimeoutRef.current);
      }
      stopTypingSound();
    };
  }, [messages, activeChat, soundEnabled, aiEnabled, autoReplyDelay]);

  // Envoi de message amélioré
  const handleSend = useCallback((e, { message, media = [] } = {}) => {
    e?.preventDefault();
    
    if (!message?.trim() && media.length === 0) return;

    if (soundEnabled) playSendSound();

    const newMessage = {
      id: Date.now().toString(),
      text: message || '',
      media,
      sender: 'me',
      senderId: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      status: 'sending',
      reactions: [],
      isRead: false,
      type: media.length > 0 ? 'media' : 'text',
      replyTo: replyingTo?.id || null,
      mentions: extractMentions(message || '')
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setShowEmojiPicker(false);
    setReplyingTo(null);
    
    // Nettoyer le brouillon
    saveDraft('');

    // Simulation progression envoi avec états réalistes
    const updateMessageStatus = (status, isRead = false) => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status, ...(isRead && { isRead }) } 
          : msg
      ));
    };

    setTimeout(() => updateMessageStatus('sent'), 300);
    setTimeout(() => updateMessageStatus('delivered'), 800);
    setTimeout(() => updateMessageStatus('read', true), 1600);
    
  }, [soundEnabled, playSendSound, replyingTo, saveDraft]);

  // Extraction des mentions
  const extractMentions = useCallback((text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        username: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    return mentions;
  }, []);

  // Édition de message
  const editMessage = useCallback((messageId, newText) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            text: newText, 
            isEdited: true,
            editedAt: new Date().toISOString()
          } 
        : msg
    ));
    setEditingMessage(null);
  }, [setMessages]);

  // Suppression de message
  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [setMessages]);

  // Épingler un message
  const pinMessage = useCallback((messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPinned: !msg.isPinned }
        : msg
    ));
  }, [setMessages]);

  // Marquer un message comme important
  const markAsImportant = useCallback((messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isImportant: !msg.isImportant }
        : msg
    ));
  }, [setMessages]);

  // Copier un message
  const copyMessage = useCallback((messageText) => {
    navigator.clipboard.writeText(messageText).then(() => {
      console.log('Message copié !');
    });
  }, []);

  // Transférer un message
  const forwardMessage = useCallback((messageId) => {
    // Logique de transfert à implémenter
    console.log('Transfert du message:', messageId);
  }, []);

  // Scroll automatique amélioré
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    };

    // Délai pour permettre l'animation des nouveaux messages
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Gestion des emojis
  const onEmojiClick = useCallback((emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
  }, []);

  // Gestion des réactions améliorée
  const addReaction = useCallback((messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === reaction);
        if (soundEnabled) playSendSound();
        
        if (existingReactionIndex >= 0) {
          // Retirer la réaction si elle existe déjà
          const updatedReactions = [...msg.reactions];
          updatedReactions.splice(existingReactionIndex, 1);
          return { ...msg, reactions: updatedReactions };
        } else {
          // Ajouter la nouvelle réaction
          return { 
            ...msg, 
            reactions: [...msg.reactions, { 
              emoji: reaction, 
              count: 1,
              users: ['me'],
              timestamp: new Date().toISOString()
            }]
          };
        }
      }
      return msg;
    }));
  }, [setMessages, soundEnabled, playSendSound]);

  // Filtrage des messages amélioré
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    
    return messages.filter(msg => {
      const textMatch = msg.text.toLowerCase().includes(searchQuery.toLowerCase());
      const senderMatch = msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
      const timeMatch = msg.time.includes(searchQuery);
      
      return textMatch || senderMatch || timeMatch;
    });
  }, [messages, searchQuery]);

  // Messages épinglés
  const pinnedMessages = useMemo(() => {
    return messages.filter(msg => msg.isPinned);
  }, [messages]);

  // Messages importants
  const importantMessages = useMemo(() => {
    return messages.filter(msg => msg.isImportant);
  }, [messages]);

  // Toggle des sons
  const toggleSounds = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) playReceiveSound();
  }, [soundEnabled, playReceiveSound, setSoundEnabled]);

  // Toggle IA
  const toggleAI = useCallback(() => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    
    if (!newState && activeChat?.id) {
      // Nettoyer l'historique IA quand désactivé
      clearChatHistory(activeChat.id);
    }
  }, [aiEnabled, setAiEnabled, activeChat?.id]);

  // Gestion des brouillons en temps réel
  useEffect(() => {
    const handler = setTimeout(() => {
      saveDraft(inputValue);
    }, 1000);

    return () => clearTimeout(handler);
  }, [inputValue, saveDraft]);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (aiResponseTimeoutRef.current) clearTimeout(aiResponseTimeoutRef.current);
      stopTypingSound();
    };
  }, [stopTypingSound]);

  return {
    // État de base
    messages,
    inputValue,
    isTyping,
    searchQuery,
    showEmojiPicker,
    showSearch,
    showMenu,
    soundEnabled,
    filteredMessages,
    
    // Nouvelles fonctionnalités
    aiEnabled,
    autoReplyDelay,
    replyingTo,
    editingMessage,
    pinnedMessages,
    importantMessages,
    messageActions,
    
    // Actions de base
    handleSend,
    setInputValue,
    setShowEmojiPicker,
    setSearchQuery,
    setShowSearch,
    setShowMenu,
    toggleSounds,
    onEmojiClick,
    addReaction,
    
    // Nouvelles actions
    toggleAI,
    setAutoReplyDelay,
    setReplyingTo,
    setEditingMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    markAsImportant,
    copyMessage,
    forwardMessage,
    saveDraft,
    
    // Références
    messagesEndRef
  };
};

export default useChatMessages;