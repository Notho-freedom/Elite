import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from '../ChatHeader';
import ChatSearch from '../ChatSearch';
import ChatMenu from '../ChatMenu';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import EnhancedChatInput from './EnhancedChatInput';
import TypingIndicator from '../TypingIndicator';
import MediaViewer from '../MediaViewer';
import { useApp } from '../../Context/AppContext';
import { useAuth } from '../../Context/AuthContext';
import { useMessageNotifications } from '../Notif';
import { normalizeMessage } from '../../Enhanced/EliteDataEnricher';

const EnhancedChatPage = () => {
  const {
    activeChat,
    setActiveChat,
    theme,
    sendMessage,
    messages,
    setMessages,
    setActiveCall,
    setShowProfile,
    isMobile
  } = useApp();
  const { user } = useAuth();
  const { notifyMessageAction } = useMessageNotifications();

  // États locaux
  const [inputValue, setInputValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [lockedMessages, setLockedMessages] = useState([]);
  const [hiddenMessages, setHiddenMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [mediaViewerData, setMediaViewerData] = useState({ isOpen: false, media: [], initialIndex: 0 });

  // Refs
  const messagesEndRef = useRef(null);
  const chatHeaderRef = useRef(null);
  const messageRefs = useRef(new Map());

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight temporaire
      messageElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
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
        notifyMessageAction('reply');
        break;
        
      case 'edit':
        if (message.senderId === user.id) {
          setEditingMessage(message);
          setInputValue(message.text || '');
          notifyMessageAction('edit');
        }
        break;
        
      case 'forward':
        // Copier le message pour transfert
        const forwardData = {
          text: message.text,
          media: message.media,
          originalSender: message.sender
        };
        localStorage.setItem('forwardMessage', JSON.stringify(forwardData));
        notifyMessageAction('forward');
        break;
        
      case 'copy':
        if (message.text) {
          navigator.clipboard.writeText(message.text);
          notifyMessageAction('copy');
        }
        break;
        
      case 'favorite':
        const isFavorite = favoriteMessages.includes(message.id);
        if (isFavorite) {
          setFavoriteMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setFavoriteMessages(prev => [...prev, message.id]);
        }
        notifyMessageAction('favorite', { isFavorite });
        break;
        
      case 'pin':
        const isPinned = pinnedMessages.includes(message.id);
        if (isPinned) {
          setPinnedMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setPinnedMessages(prev => [...prev, message.id]);
        }
        notifyMessageAction('pin', { isPinned });
        break;
        
      case 'lock':
        const isLocked = lockedMessages.includes(message.id);
        if (isLocked) {
          setLockedMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setLockedMessages(prev => [...prev, message.id]);
        }
        notifyMessageAction('lock', { isLocked });
        break;
        
      case 'download':
        if (message.media?.length > 0) {
          message.media.forEach(async (media, index) => {
            try {
              const response = await fetch(media.url);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `media-${Date.now()}-${index}.${media.type.split('/')[1]}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Erreur téléchargement:', error);
            }
          });
          notifyMessageAction('download');
        }
        break;
        
      case 'hide':
        const isHidden = hiddenMessages.includes(message.id);
        if (isHidden) {
          setHiddenMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setHiddenMessages(prev => [...prev, message.id]);
        }
        notifyMessageAction('hide', { isHidden });
        break;
        
      case 'info':
        // Afficher les informations détaillées du message
        const messageInfo = {
          id: message.id,
          sender: message.sender,
          timestamp: message.timestamp,
          edited: message.isEdited,
          reactions: message.reactions?.length || 0,
          mediaCount: message.media?.length || 0
        };
        console.log('Informations du message:', messageInfo);
        // TODO: Ouvrir modal d'informations
        break;
        
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
          setMessages(prev => prev.filter(msg => msg.id !== message.id));
          notifyMessageAction('delete');
        }
        break;
        
      case 'select':
        const isSelected = selectedMessages.includes(message.id);
        if (isSelected) {
          setSelectedMessages(prev => prev.filter(id => id !== message.id));
        } else {
          setSelectedMessages(prev => [...prev, message.id]);
        }
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
      setMessages(prev => prev.map(msg => 
        msg.id === data.editId 
          ? { ...msg, text: messageData.text, isEdited: true, editedAt: messageData.timestamp }
          : msg
      ));
      setEditingMessage(null);
      notifyMessageAction('edit');
    } else {
      // Nouveau message
      sendMessage(messageData.text || messageData, messageData.type || 'text');
    }

    // Reset des états
    setInputValue('');
    setReplyingTo(null);
  };

  // Ouvrir le visualiseur de médias
  const openMediaViewer = (mediaList, initialIndex = 0) => {
    setMediaViewerData({
      isOpen: true,
      media: mediaList,
      initialIndex
    });
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

  // Filtrer les messages selon la recherche et les messages cachés
  const filteredMessages = (messages || []).filter(msg => {
    if (hiddenMessages.includes(msg.id)) return false;
    if (!searchQuery) return true;
    return normalizeMessage(msg).text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Enrichir les messages avec les états
  const enrichedMessages = filteredMessages.map(msg => ({
    ...msg,
    isPinned: pinnedMessages.includes(msg.id),
    isFavorite: favoriteMessages.includes(msg.id),
    isLocked: lockedMessages.includes(msg.id),
    isSelected: selectedMessages.includes(msg.id),
  }));

  // Variants pour les animations
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  if (!activeChat) {
    return (
      <div className={`flex-1 flex items-center justify-center mt-[40%] ${theme.bgColor}`}>
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
            onClose={() => setShowSearch(false)}
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
                    onClick={() => scrollToMessage(msg.id)}
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

      {/* Actions en masse pour les messages sélectionnés */}
      <AnimatePresence>
        {selectedMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${theme.headerBg} border-b ${theme.borderColor} px-4 py-2`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme.textColor}`}>
                {selectedMessages.length} message(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    selectedMessages.forEach(id => handleMessageAction('delete', { id }));
                    setSelectedMessages([]);
                  }}
                  className="px-3 py-1 text-red-500 text-sm hover:bg-red-500/10 rounded"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedMessages([])}
                  className={`px-3 py-1 text-sm ${theme.textColor} hover:${theme.hoverBg} rounded`}
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone des messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-2 space-y-4 ${isMobile ? 'pb-[20vh]' : 'pb-4'}`}>
        {/* Debug: Afficher le nombre de messages */}
        {enrichedMessages.length === 0 && (
          <div className={`text-center py-8 ${theme.secondaryText}`}>
            <div className="text-4xl mb-4">💬</div>
            <p>Aucun message dans cette conversation</p>
            <p className="text-sm mt-2">Commencez à discuter !</p>
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {enrichedMessages.map((message) => (
            <motion.div
              key={message.id}
              ref={el => messageRefs.current.set(message.id, el)}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                ${message.senderId === user.id ? 'ml-10' : 'mr-10'} 
                max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]
              `}>
                <EnhancedMessageBubble
                  message={normalizeMessage(message)}
                  theme={theme}
                  openMediaViewer={openMediaViewer}
                  onMessageAction={handleMessageAction}
                  currentUserId={user.id}
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

      {/* Visualiseur de médias */}
      <MediaViewer
        isOpen={mediaViewerData.isOpen}
        onClose={() => setMediaViewerData(prev => ({ ...prev, isOpen: false }))}
        media={mediaViewerData.media}
        initialIndex={mediaViewerData.initialIndex}
        theme={theme}
        onAction={(action, media) => {
          notifyMessageAction(action, media);
        }}
      />
    </motion.div>
  );
};

export default EnhancedChatPage;
