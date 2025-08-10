import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsArrowLeft, 
  BsThreeDotsVertical, 
  BsPhone, 
  BsVideoCall, 
  BsSearch,
  BsPaperclip,
  BsEmojiSmile,
  BsMic,
  BsSend,
  BsPin,
  BsDownload,
  BsWifi,
  BsWifiOff,
  BsCheck2All,
  BsVolumeMute,
  BsVolumeUp
} from 'react-icons/bs';
import { FiEdit2, FiTrash2, FiCopy, FiShare, FiStar } from 'react-icons/fi';
import { useApp } from './Context/AppContext';
import { useAuth } from './Context/AuthContext';
import useChatMessages from '../hooks/useChatMessages';
import ChatMessage from './chat/ChatMessage';
import TypingIndicator from './chat/TypingIndicator';
import DemoIndicator from './chat/DemoIndicator';
import EmojiPickerWrapper from './chat/EmojiPickerWrapper';

const ChatPage = () => {
  const { theme, activeChat, setActiveChat, setShowProfile, isAuthenticated } = useApp();
  const { user } = useAuth();
  
  const {
    messages,
    filteredMessages,
    pinnedMessages,
    loading,
    error,
    hasMore,
    inputValue,
    isTyping,
    showEmojiPicker,
    showSearch,
    searchQuery,
    typingUsers,
    replyingTo,
    editingMessage,
    soundEnabled,
    aiEnabled,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMoreMessages,
    scrollToBottom,
    setInputValue,
    setShowEmojiPicker,
    setShowSearch,
    setSearchQuery,
    setReplyingTo,
    setEditingMessage,
    setSoundEnabled,
    setAiEnabled,
    messagesEndRef,
    inputRef,
    clearError,
    refreshMessages
  } = useChatMessages();

  // États UI locaux
  const [showActions, setShowActions] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Références
  const chatContainerRef = useRef(null);
  const headerRef = useRef(null);
  const inputContainerRef = useRef(null);

  // Gérer la connexion réseau
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gestion de l'envoi de message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue.trim());
    setInputValue('');
  };

  // Gestion des touches
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Actions sur les messages
  const handleMessageAction = (action, message) => {
    switch (action) {
      case 'reply':
        setReplyingTo(message);
        inputRef.current?.focus();
        break;
      case 'edit':
        setEditingMessage(message);
        setInputValue(message.content || message.text);
        inputRef.current?.focus();
        break;
      case 'delete':
        deleteMessage(message.id);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content || message.text);
        break;
      case 'pin':
        // TODO: Implémenter le pinning
        break;
      default:
        break;
    }
  };

  // Annuler la réponse ou l'édition
  const cancelAction = () => {
    setReplyingTo(null);
    setEditingMessage(null);
    setInputValue('');
  };

  // Confirmer l'édition
  const confirmEdit = async () => {
    if (!editingMessage || !inputValue.trim()) return;
    
    await editMessage(editingMessage.id, inputValue.trim());
    setEditingMessage(null);
    setInputValue('');
  };

  if (!activeChat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${theme.bgColor}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <BsPhone className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Sélectionnez une conversation
          </h3>
          <p className="text-gray-500">
            Choisissez une conversation dans la liste pour commencer à discuter
          </p>
        </div>
      </div>
    );
  }

  const displayMessages = showSearch ? filteredMessages : messages;

  return (
    <div className={`flex-1 flex flex-col h-full relative ${theme.bgColor}`}>
      {/* Indicateur de démonstration */}
      {!isAuthenticated && (
        <DemoIndicator 
          theme={theme} 
          aiEnabled={aiEnabled} 
          onToggleAI={() => setAiEnabled(!aiEnabled)} 
        />
      )}

      {/* Header du chat */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between p-4 border-b ${theme.borderColor} ${theme.bgSecondary} backdrop-blur-sm sticky top-0 z-10`}
      >
        {/* Bouton retour + Info contact */}
        <div className="flex items-center gap-3 flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveChat(null)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BsArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 flex-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            {/* Avatar avec statut en ligne */}
            <div className="relative">
              <img
                src={activeChat.avatar || 'https://via.placeholder.com/40'}
                alt={activeChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {activeChat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </div>

            {/* Nom et statut */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeChat.name}
                </h3>
                {!isOnline && <BsWifiOff className="w-4 h-4 text-red-500" />}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {typingUsers.length > 0 ? (
                  <span className="text-blue-500 font-medium">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].user?.name || 'Contact'} tape...`
                      : `${typingUsers.length} personnes tapent...`
                    }
                  </span>
                ) : activeChat.isOnline ? (
                  <span className="text-green-500">En ligne</span>
                ) : (
                  <span>Vu {activeChat.time}</span>
                )}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Actions header */}
        <div className="flex items-center gap-2">
          {/* Recherche */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-full transition-colors ${
              showSearch 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <BsSearch className="w-5 h-5" />
          </motion.button>

          {/* Messages épinglés */}
          {pinnedMessages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className={`p-2 rounded-full relative transition-colors ${
                showPinnedMessages 
                  ? 'bg-yellow-500 text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <BsPin className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pinnedMessages.length}
              </span>
            </motion.button>
          )}

          {/* Appel audio */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BsPhone className="w-5 h-5" />
          </motion.button>

          {/* Appel vidéo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BsVideoCall className="w-5 h-5" />
          </motion.button>

          {/* Son */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${
              soundEnabled 
                ? 'text-blue-500' 
                : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {soundEnabled ? <BsVolumeUp className="w-5 h-5" /> : <BsVolumeMute className="w-5 h-5" />}
          </motion.button>

          {/* Menu actions */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          >
            <BsThreeDotsVertical className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Menu déroulant actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute top-full right-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-48 z-20"
            >
              {[
                { icon: FiStar, label: 'Messages importants', action: () => {} },
                { icon: BsDownload, label: 'Exporter conversation', action: () => {} },
                { icon: FiTrash2, label: 'Effacer conversation', action: () => {}, danger: true }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    item.action();
                    setShowActions(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    item.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-4 py-3 border-b ${theme.borderColor} ${theme.bgSecondary}`}
          >
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans la conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.borderColor} ${theme.bgColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                {filteredMessages.length} résultat(s) trouvé(s)
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages épinglés */}
      <AnimatePresence>
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b ${theme.borderColor} ${theme.bgSecondary}`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  Messages épinglés ({pinnedMessages.length})
                </h4>
                <button
                  onClick={() => setShowPinnedMessages(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pinnedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-start gap-2">
                      <BsPin className="w-3 h-3 text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {message.content || message.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.senderName || message.sender} • {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone des messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        style={{ 
          scrollBehavior: 'smooth',
          backgroundImage: theme.name === 'dark' 
            ? 'none' 
            : 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        {/* Bouton charger plus */}
        {hasMore && messages.length > 0 && (
          <div className="text-center py-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMoreMessages}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Chargement...' : 'Charger plus de messages'}
            </motion.button>
          </div>
        )}

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-red-700 dark:text-red-400 text-sm">
                  Erreur: {error}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={refreshMessages}
                    className="text-red-600 hover:text-red-700 text-sm underline"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des messages */}
        <AnimatePresence>
          {displayMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              theme={theme}
              currentUserId={user?.id}
              isAuthenticated={isAuthenticated}
              onReply={() => handleMessageAction('reply', message)}
              onEdit={() => handleMessageAction('edit', message)}
              onDelete={() => handleMessageAction('delete', message)}
              onCopy={() => handleMessageAction('copy', message)}
              onPin={() => handleMessageAction('pin', message)}
              onReaction={(emoji) => addReaction(message.id, emoji)}
              showAvatar={
                index === displayMessages.length - 1 || 
                displayMessages[index + 1]?.senderId !== message.senderId
              }
              showTime={
                index === displayMessages.length - 1 || 
                displayMessages[index + 1]?.senderId !== message.senderId ||
                (new Date(displayMessages[index + 1]?.timestamp) - new Date(message.timestamp)) > 300000 // 5 minutes
              }
            />
          ))}
        </AnimatePresence>

        {/* Indicateur de frappe */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <TypingIndicator 
              users={typingUsers}
              theme={theme}
            />
          )}
        </AnimatePresence>

        {/* Référence pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de réponse/édition */}
      <AnimatePresence>
        {(replyingTo || editingMessage) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-4 py-3 border-t ${theme.borderColor} ${theme.bgSecondary}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-1 h-12 rounded-full ${
                editingMessage ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  editingMessage ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {editingMessage ? 'Modifier le message' : `Répondre à ${replyingTo?.senderName || replyingTo?.sender}`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {(editingMessage?.content || replyingTo?.content)?.substring(0, 100)}
                </p>
              </div>
              <button
                onClick={cancelAction}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie */}
      <motion.div
        ref={inputContainerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 border-t ${theme.borderColor} ${theme.bgSecondary} backdrop-blur-sm`}
      >
        <div className="flex items-end gap-3">
          {/* Boutons latéraux gauche */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <BsPaperclip className="w-5 h-5 text-gray-500" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-full transition-colors ${
                showEmojiPicker 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
              }`}
            >
              <BsEmojiSmile className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Zone de texte */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                editingMessage 
                  ? 'Modifier votre message...' 
                  : replyingTo 
                    ? 'Tapez votre réponse...' 
                    : 'Tapez votre message...'
              }
              className={`w-full px-4 py-3 pr-12 rounded-2xl border ${theme.borderColor} ${theme.bgColor} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32`}
              rows={1}
              style={{
                minHeight: '44px',
                scrollbarWidth: 'thin'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Compteur de caractères */}
            {inputValue.length > 100 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-400">
                {inputValue.length}/1000
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            {editingMessage ? (
              // Boutons d'édition
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelAction}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmEdit}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Modifier
                </motion.button>
              </>
            ) : (
              // Boutons normaux
              <>
                {!inputValue.trim() ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseDown={() => setIsRecording(true)}
                    onMouseUp={() => setIsRecording(false)}
                    onMouseLeave={() => setIsRecording(false)}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <BsMic className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <BsSend className="w-5 h-5" />
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Indicateur de saisie */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            Vous tapez...
          </div>
        )}
      </motion.div>

      {/* Picker emoji */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPickerWrapper
            theme={theme}
            onEmojiSelect={(emoji) => {
              setInputValue(prev => prev + emoji);
              setShowEmojiPicker(false);
              inputRef.current?.focus();
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Indicateur de connexion */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
          >
            <BsWifiOff className="w-4 h-4" />
            Hors ligne - Reconnexion...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;