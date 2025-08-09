// hooks/useChatMessages.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useSound from 'use-sound';
import { useLocalStorage } from 'usehooks-ts';
import { askGroq } from '../IA/AIResponse';
import { useApp } from '../Context/AppContext';

// Configuration des sons
const SOUNDS = {
  SEND: '/Sounds/pop.mp3',
  RECEIVE: '/Sounds/recieve.mp3',
  TYPING: '/Sounds/typing.mp3'
};

const useChatMessages = () => {
  // État principal
  const { activeChat, messages, setMessages, sendMessage: contextSendMessage, user } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('chatSoundsEnabled', true);
  
  // Références
  const messagesEndRef = useRef(null);
  
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

  // Gestion des réponses IA (seulement en mode démo)
  useEffect(() => {
    if (!user) { // Mode démo seulement
      const handleAIResponse = async (lastMessage) => {
        try {
          const aiReply = await askGroq(lastMessage.text, activeChat);
          
          stopTypingSound();
          setIsTyping(false);

          const replyMessage = {
            id: Date.now(),
            text: aiReply,
            sender: 'them',
            senderId: activeChat?.id || 'ai-bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
            status: 'read',
            reactions: [],
            avatar: activeChat?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };

          setMessages(prev => [...prev, replyMessage]);
          if (soundEnabled) playReceiveSound();
        } catch (err) {
          console.error('Erreur réponse IA:', err);
          stopTypingSound();
          setIsTyping(false);
        }
      };

      const lastMessage = messages[messages.length - 1];
      let typingTimeout;

      if (lastMessage?.sender === 'me' && lastMessage?.text && activeChat?.isOnline) {
        setIsTyping(true);
        if (soundEnabled) playTypingSound();
        
        typingTimeout = setTimeout(() => {
          handleAIResponse(lastMessage);
        }, 1500 + Math.random() * 2000);
      }

      return () => {
        clearTimeout(typingTimeout);
        stopTypingSound();
      };
    }
  }, [messages, activeChat, soundEnabled, user, setMessages, playReceiveSound, playTypingSound, stopTypingSound]);

  // Envoi de message (adapté à la nouvelle structure)
  const handleSend = useCallback(async (e, data) => {
    e?.preventDefault();
    
    if (!data?.message?.trim() && !data?.media?.length) return;

    if (soundEnabled) playSendSound();

    try {
      // Construire les données du message selon la nouvelle structure
      let messageData;
      
      if (data.media && data.media.length > 0) {
        // Message avec médias
        messageData = {
          message: data.message || '',
          media: data.media
        };
      } else {
        // Message texte simple
        messageData = data.message;
      }

      // Envoyer via le contexte
      const result = await contextSendMessage(messageData);

      if (result.success) {
        // Les messages sont déjà ajoutés par le contexte
        setInputValue('');
        setShowEmojiPicker(false);
      } else {
        console.error('Erreur envoi message:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    }
  }, [soundEnabled, playSendSound, contextSendMessage]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gestion des emojis
  const onEmojiClick = useCallback((emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
  }, []);

  // Gestion des réactions
  const addReaction = useCallback((messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingIndex = msg.reactions?.findIndex(r => r.emoji === reaction) || -1;
        if (soundEnabled) playSendSound();
        
        if (existingIndex >= 0) {
          const updatedReactions = [...(msg.reactions || [])];
          updatedReactions.splice(existingIndex, 1);
          return { ...msg, reactions: updatedReactions };
        }
        return { 
          ...msg, 
          reactions: [...(msg.reactions || []), { emoji: reaction, count: 1 }]
        };
      }
      return msg;
    }));
  }, [setMessages, soundEnabled, playSendSound]);

  // Filtrage des messages
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    return messages.filter(msg => 
      msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  // Toggle des sons
  const toggleSounds = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) playReceiveSound();
  }, [soundEnabled, playReceiveSound, setSoundEnabled]);

  return {
    messages,
    inputValue,
    isTyping,
    searchQuery,
    showEmojiPicker,
    showSearch,
    showMenu,
    soundEnabled,
    filteredMessages,
    handleSend,
    setInputValue,
    setShowEmojiPicker,
    setSearchQuery,
    setShowSearch,
    setShowMenu,
    toggleSounds,
    onEmojiClick,
    addReaction,
    messagesEndRef
  };
};

export default useChatMessages;