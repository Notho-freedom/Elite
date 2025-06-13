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
  const {activeChat, messages, setMessages } = useApp();
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

  // Gestion des réponses IA
  useEffect(() => {
    const handleAIResponse = async (lastMessage) => {
      try {
        const aiReply = await askGroq(lastMessage.text, activeChat);
        
        stopTypingSound();
        setIsTyping(false);

        const replyMessage = {
          id: Date.now(),
          text: aiReply,
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: []
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
  }, [messages, activeChat, soundEnabled]);

  // Envoi de message
  const handleSend = useCallback((e, { message, media = [] }) => {
    e?.preventDefault();
    
    if (!message?.trim() && media.length === 0) return;

    if (soundEnabled) playSendSound();

    const newMessage = {
      id: Date.now(),
      text: message || '',
      media,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: [],
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setShowEmojiPicker(false);

    // Simulation progression envoi
    const updateMessageStatus = (status, isRead = false) => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status, ...(isRead && { isRead }) } 
          : msg
      ));
    };

    setTimeout(() => updateMessageStatus('delivered'), 800);
    setTimeout(() => updateMessageStatus('read', true), 1600);
  }, [soundEnabled, playSendSound]);

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
        const existingIndex = msg.reactions.findIndex(r => r.emoji === reaction);
        if (soundEnabled) playSendSound();
        if (existingIndex >= 0) {
          const updatedReactions = [...msg.reactions];
          updatedReactions.splice(existingIndex, 1);
          return { ...msg, reactions: updatedReactions };
        }
        return { 
          ...msg, 
          reactions: [...msg.reactions, { emoji: reaction, count: 1 }]
        };
      }
      return msg;
    }));
  }, [setMessages, soundEnabled, playSendSound]);

  // Filtrage des messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
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