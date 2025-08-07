import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from '../ChatHeader';
import ChatSearch from '../ChatSearch';
import ChatMenu from '../ChatMenu';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import EnhancedChatInput from './EnhancedChatInput';
import TypingIndicator from '../TypingIndicator';
import { useApp } from '../../Context/AppContext';

const EnhancedChatPage = () => {
  const {
    activeChat,
    setActiveChat,
    theme,
    sendMessage,
    messages,
    setActiveCall,
    setShowProfile,
    isMobile
  } = useApp();

  // États locaux
  const [inputValue, setInputValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const chatHeaderRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulation du typing indicator
  useEffect(() => {
    if (inputValue.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputValue]);

  // Gestion des actions sur les messages
  const handleMessageAction = (action, message) => {
    switch (action) {
      case 'reply':
        setReplyingTo(message);
        break;
        
      case 'edit':
        if (message.sender === 'me') {
          setEditingMessage(message);
          setInputValue(message.text || '');
        }
        break;
        
      case 'forward':
        // TODO: Implémenter le transfert
        console.log('Transférer message:', message);
        break;
        
      case 'copy':
        if (message.text) {
          navigator.clipboard.writeText(message.text);
          // TODO: Afficher notification de copie
        }
        break;
        
      case 'favorite':
        // TODO: Basculer l'état favori
        console.log('Toggle favorite:', message);
        break;
        
      case 'pin':
        if (message.isPinned) {
          setPinnedMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setPinnedMessages(prev => [...prev, message.id]);
        }
        break;
        
      case 'lock':
        // TODO: Basculer l'état verrouillé
        console.log('Toggle lock:', message);
        break;
        
      case 'download':
        if (message.media?.length > 0) {
          // TODO: Télécharger les médias
          console.log('Télécharger médias:', message.media);
        }
        break;
        
      case 'hide':
        // TODO: Masquer le message
        console.log('Masquer message:', message);
        break;
        
      case 'info':
        // TODO: Afficher les informations du message
        console.log('Infos message:', message);
        break;
        
      case 'delete':
        // TODO: Supprimer le message
        console.log('Supprimer message:', message);
        break;
        
      default:
        console.log('Action non reconnue:', action, message);
    }
  };

  // Gestion de l'envoi de messages
  const handleSend = (e, data) => {
    e.preventDefault();
    
    if (!data.message?.trim() && !data.media?.length) return;

    const messageData = {
      text: data.message,
      media: data.media || [],
      replyTo: data.replyTo,
      timestamp: new Date().toISOString(),
      sender: 'me',
      isRead: false,
      isEdited: !!data.editId
    };

    if (data.editId) {
      // Mode édition
      // TODO: Mettre à jour le message existant
      console.log('Mise à jour message:', data.editId, messageData);
      setEditingMessage(null);
    } else {
      // Nouveau message
      sendMessage(messageData);
    }

    // Reset des états
    setInputValue('');
    setReplyingTo(null);
  };

  // Démarrer un appel
  const handleStartCall = (callData) => {
    setActiveCall({
      ...callData,
      name: activeChat.name,
      avatar: activeChat.avatar,
      status: callData.type === 'video' ? 'FaceTime Video' : 'FaceTime Audio',
      isMuted: false,
      isVideoOn: callData.type === 'video',
      isScreenSharing: false,
    });
  };

  // Ouvrir le profil
  const handleProfileOpen = () => {
    setShowProfile(true);
  };

  // Filtrer les messages selon la recherche
  const filteredMessages = (messages || []).filter(msg => {
    if (!searchQuery) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Enrichir les messages avec les états
  const enrichedMessages = filteredMessages.map(msg => ({
    ...msg,
    isPinned: pinnedMessages.includes(msg.id),
    isFavorite: msg.isFavorite || false,
    isLocked: msg.isLocked || false,
  }));

  // Variants pour les animations
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  if (!activeChat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${theme.bgColor}`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${theme.secondaryText}`}>💬</div>
          <h3 className={`text-xl font-medium ${theme.textColor} mb-2`}>
            Sélectionnez une conversation
          </h3>
          <p className={theme.secondaryText}>
            Choisissez une discussion pour commencer à discuter
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`flex-1 flex flex-col h-screen ${theme.bgColor} relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <ChatHeader
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onStartCall={handleStartCall}
        setShowSearch={setShowSearch}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        theme={theme}
        chatHeaderRef={chatHeaderRef}
        isTyping={isTyping}
        onProfileOpen={handleProfileOpen}
      />

      {/* Barre de recherche */}
      <AnimatePresence>
        {showSearch && (
          <ChatSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Menu contextuel */}
      <ChatMenu showMenu={showMenu} theme={theme} />

      {/* Messages épinglés */}
      <AnimatePresence>
        {pinnedMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${theme.headerBg} border-b ${theme.borderColor} px-4 py-2`}
          >
            <div className={`text-xs font-medium ${theme.secondaryText} mb-1`}>
              Messages épinglés ({pinnedMessages.length})
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {enrichedMessages
                .filter(msg => msg.isPinned)
                .slice(0, 3)
                .map(msg => (
                  <div 
                    key={msg.id}
                    className={`
                      flex-shrink-0 p-2 rounded-lg ${theme.messageBg} 
                      cursor-pointer hover:${theme.hoverBg}
                      max-w-[200px]
                    `}
                    onClick={() => {
                      // TODO: Scroll vers le message
                      console.log('Scroll vers message épinglé:', msg.id);
                    }}
                  >
                    <div className={`text-xs ${theme.textColor} truncate`}>
                      {msg.text || 'Média'}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone des messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-2 space-y-4 ${isMobile ? 'pb-[20vh]' : 'pb-4'}`}>
        <AnimatePresence mode="popLayout">
          {enrichedMessages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                ${message.sender === 'me' ? 'ml-10' : 'mr-10'} 
                max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]
              `}>
                <EnhancedMessageBubble
                  message={message}
                  theme={theme}
                  openMediaViewer={(index) => {
                    // TODO: Ouvrir le visualiseur de médias
                    console.log('Ouvrir média:', index);
                  }}
                  onMessageAction={handleMessageAction}
                  currentUserId="me"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicateur de frappe */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="mr-10">
                <TypingIndicator theme={theme} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Référence pour l'auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone d'input améliorée */}
      <EnhancedChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        theme={theme}
        recipient={activeChat}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => {
          setEditingMessage(null);
          setInputValue('');
        }}
      />
    </motion.div>
  );
};

export default EnhancedChatPage;
