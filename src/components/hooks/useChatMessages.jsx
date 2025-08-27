// hooks/useChatMessages.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useSound from 'use-sound';
import { useLocalStorage } from 'usehooks-ts';
// import { askGroq } from '../IA/AIResponse'; // IA désactivée
import { useApp } from '../Context/AppContext';

// Configuration des sons
const SOUNDS = {
  SEND: '/Sounds/pop.mp3',
  RECEIVE: '/Sounds/recieve.mp3',
  TYPING: '/Sounds/pop.mp3' // Utiliser pop.mp3 en attendant typing.mp3
};

const useChatMessages = () => {
  // État principal
  const { 
    activeChat, 
    messages, 
    messagesLoading,
    sendMessage, 
    markMessagesAsRead,
    uploadMedia,
    user 
  } = useApp();
  
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

  // Marquer les messages comme lus quand la conversation est active
  useEffect(() => {
    if (activeChat?.id && messages.length > 0) {
      markMessagesAsRead(activeChat.id);
    }
  }, [activeChat?.id, messages.length, markMessagesAsRead]);

  // Gestion des réponses IA - DÉSACTIVÉE
  // useEffect(() => {
  //   const handleAIResponse = async (lastMessage) => {
  //     try {
  //       const aiReply = await askGroq(lastMessage.text, activeChat);
  //       
  //       stopTypingSound();
  //       setIsTyping(false);

  //       // Envoyer la réponse IA via Firebase
  //       await sendMessage(activeChat.id, {
  //         text: aiReply,
  //         type: 'text'
  //       });

  //       if (soundEnabled) playReceiveSound();
  //     } catch (err) {
  //       console.error('Erreur réponse IA:', err);
  //       stopTypingSound();
  //       setIsTyping(false);
  //     }
  //   };

  //   const lastMessage = messages[messages.length - 1];
  //   let typingTimeout;

  //   if (lastMessage?.senderId === user?.uid && lastMessage?.text && activeChat?.isOnline) {
  //     setIsTyping(true);
  //     if (soundEnabled) playTypingSound();
  //     
  //     typingTimeout = setTimeout(() => {
  //       handleAIResponse(lastMessage);
  //     }, 1500 + Math.random() * 2000);
  //   }

  //   return () => {
  //     clearTimeout(typingTimeout);
  //     stopTypingSound();
  //   };
  // }, [messages, activeChat, user?.uid, soundEnabled, sendMessage, playReceiveSound, playTypingSound, stopTypingSound]);

  // Envoi de message
  const handleSend = useCallback(async (e, { message, media = [] }) => {
    e?.preventDefault();
    
    if (!message?.trim() && media.length === 0) return;
    if (!activeChat?.id) return;

    if (soundEnabled) playSendSound();

    try {
      // Upload des médias si présents
      let uploadedMedia = [];
      if (media.length > 0) {
        for (const mediaItem of media) {
          if (mediaItem.file) {
            const uploadResult = await uploadMedia(
              mediaItem.file, 
              activeChat.id, 
              mediaItem.type
            );
            uploadedMedia.push({
              url: uploadResult.url,
              type: mediaItem.type,
              name: mediaItem.file.name,
              size: uploadResult.size
            });
          } else if (mediaItem.url) {
            uploadedMedia.push(mediaItem);
          }
        }
      }

        // Envoyer le message via Firebase
  await sendMessage(activeChat.id, {
    text: inputValue || '',
    media: uploadedMedia,
    type: uploadedMedia.length > 0 ? 'media' : 'text'
  });

      setInputValue('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Ici vous pourriez afficher un message d'erreur à l'utilisateur
    }
  }, [activeChat?.id, inputValue, soundEnabled, playSendSound, sendMessage, uploadMedia, setInputValue, setShowEmojiPicker]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gestion des emojis
  const onEmojiClick = useCallback((emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
  }, []);

  // Gestion des réactions
  const addReaction = useCallback(async (messageId, reaction) => {
    try {
      // Ici vous devriez implémenter l'ajout de réaction via Firebase
      // databaseService.addReaction(messageId, user.uid, reaction);
      if (soundEnabled) playSendSound();
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
    }
  }, [user?.uid, soundEnabled, playSendSound]);

  // Filtrage des messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => 
      msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
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
    messagesEndRef,
    loading: messagesLoading
  };
};

export default useChatMessages;