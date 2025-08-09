import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './Context/AppContext';
import useChatMessages from './hooks/useChatMessages';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatSearch from './chat/ChatSearch';
import ChatMenu from './chat/ChatMenu';
import ChatSettings from './chat/ChatSettings';
import EmojiPickerWrapper from './chat/EmojiPickerWrapper';
import TypingIndicator from './chat/TypingIndicator';
import { useChatSync, ConnectionStatus, PerformanceOptimizer } from './chat/ChatSync';
import { getAIStats } from './IA/AIResponse';
import { BsPin, BsStar, BsGear, BsWifi } from 'react-icons/bs';

const ChatPage = () => {
  const { 
    theme, 
    activeChat, 
    setActiveChat, 
    setActiveCall, 
    setShowProfile 
  } = useApp();
  
  const {
    messages,
    inputValue,
    isTyping,
    searchQuery,
    showEmojiPicker,
    showSearch,
    showMenu,
    soundEnabled,
    filteredMessages,
    aiEnabled,
    autoReplyDelay,
    replyingTo,
    editingMessage,
    pinnedMessages,
    importantMessages,
    handleSend,
    setInputValue,
    setShowEmojiPicker,
    setSearchQuery,
    setShowSearch,
    setShowMenu,
    toggleSounds,
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
    onEmojiClick,
    addReaction,
    messagesEndRef
  } = useChatMessages();

  // État pour les nouveaux modaux
  const [showSettings, setShowSettings] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);

  // Hook de synchronisation
  const { syncStatus, connectionQuality, isDataFresh, forceSync } = useChatSync(activeChat?.id);

  // Styles
  const backgroundStyles = {
    backgroundImage: 'url("https://images5.alphacoders.com/133/thumb-1920-1339662.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 50 },
  };

  // Gestionnaires pour les actions
  const handleExportChat = () => {
    const chatData = {
      chat: activeChat,
      messages: messages,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${activeChat?.name || 'conversation'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportChat = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const chatData = JSON.parse(e.target.result);
            console.log('Chat data imported:', chatData);
            // Ici on pourrait intégrer les messages importés
          } catch (error) {
            console.error('Erreur lors de l\'import:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearHistory = () => {
    // setMessages([]); // This line was removed from useChatMessages, so it's removed here.
    localStorage.removeItem('elite_chat_messages');
    console.log('Historique effacé');
  };

  return (
    <motion.div 
      className={`flex flex-col h-screen lg:border-l lg:border-r ${theme.borderColor} relative`}
      style={backgroundStyles}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header avec nouveaux boutons */}
      <div className="relative">
        <ChatHeader 
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onStartCall={() => setActiveCall({
            id: Date.now(),
            contact: activeChat,
            type: 'voice',
            isMuted: false,
            isVideoOn: false,
            duration: 0
          })}
          setShowSearch={setShowSearch}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          theme={theme}
          isTyping={isTyping}
          onProfileOpen={() => setShowProfile(true)}
          soundEnabled={soundEnabled}
          toggleSounds={toggleSounds}
        />
        
                 {/* Barre d'actions rapides */}
         <div className={`px-4 py-2 border-b ${theme.borderColor} bg-white/80 dark:bg-gray-800/80 backdrop-blur`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               {/* Messages épinglés */}
               {pinnedMessages.length > 0 && (
                 <button
                   onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                   className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${theme.buttonSecondary} hover:opacity-80 transition-opacity`}
                 >
                   <BsPin className="text-yellow-500" />
                   {pinnedMessages.length} épinglé{pinnedMessages.length > 1 ? 's' : ''}
                 </button>
               )}
               
               {/* Messages importants */}
               {importantMessages.length > 0 && (
                 <button className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${theme.buttonSecondary}`}>
                   <BsStar className="text-yellow-500" />
                   {importantMessages.length} important{importantMessages.length > 1 ? 's' : ''}
                 </button>
               )}
               
               {/* Indicateur IA */}
               {aiEnabled && (
                 <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-600 dark:text-blue-400">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                   IA Active
                 </div>
               )}

               {/* Statut de connexion */}
               <div className="flex items-center gap-2">
                 <ConnectionStatus theme={theme} />
                 {!isDataFresh && (
                   <button
                     onClick={forceSync}
                     className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs"
                     title="Actualiser"
                   >
                     <BsWifi className="text-gray-500" />
                   </button>
                 )}
               </div>
             </div>
             
             <button
               onClick={() => setShowSettings(true)}
               className={`p-2 rounded-full ${theme.buttonSecondary} hover:opacity-80 transition-opacity`}
               title="Paramètres du chat"
             >
               <BsGear className="text-gray-600 dark:text-gray-400" />
             </button>
           </div>
         </div>
      </div>

      {/* Réponse en cours */}
      {replyingTo && (
        <div className={`mx-4 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Réponse à {replyingTo.sender === 'me' ? 'vous' : activeChat?.name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 truncate">
                {replyingTo.text}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages épinglés popup */}
      <AnimatePresence>
        {showPinnedMessages && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-sm">Messages épinglés</h3>
            </div>
            <div className="p-2 space-y-2">
              {pinnedMessages.map(message => (
                <div key={message.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm">
                  <div className="font-medium text-xs text-gray-500 mb-1">
                    {message.sender === 'me' ? 'Vous' : activeChat?.name} • {message.time}
                  </div>
                  <div className="truncate">{message.text}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSearch && (
        <ChatSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          onClose={() => setShowSearch(false)}
        />
      )}
  
      <div 
        className={`flex-1 overflow-y-auto ${showSearch ? 'pt-2' : 'p-[0.8rem]'} relative`}
        onClick={() => {
          setShowEmojiPicker(false);
          setShowMenu(false);
          setShowPinnedMessages(false);
        }}
      >
        <AnimatePresence>
          {(searchQuery ? filteredMessages : messages).map((message) => (
            <PerformanceOptimizer key={`opt-${message.id}`}>
              <ChatMessage 
                key={`msg-${message.id}-${message.time}`}
                message={message}
                addReaction={addReaction}
                theme={theme}
                variants={messageVariants}
                activeChat={activeChat}
                onReply={setReplyingTo}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onPin={pinMessage}
                onMarkImportant={markAsImportant}
                onCopy={copyMessage}
                onForward={forwardMessage}
              />
            </PerformanceOptimizer>
          ))}
          
          {isTyping && (
            <TypingIndicator key="typing-indicator" theme={theme} />
          )}
          
          <div key="messages-end" ref={messagesEndRef} className="h-4" />
        </AnimatePresence>
      </div>
  
      <EmojiPickerWrapper 
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={onEmojiClick}
        theme={theme}
        onClose={() => setShowEmojiPicker(false)}
      />
  
      <footer className="sticky bottom-0 p-2 px-4 shadow-lg">
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          setShowEmojiPicker={setShowEmojiPicker}
          theme={theme}
          recipient={activeChat}
        />
      </footer>
  
      {showMenu && (
        <ChatMenu 
          showMenu={showMenu}
          theme={theme}
          soundEnabled={soundEnabled}
          toggleSounds={toggleSounds}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* Paramètres du chat */}
      <ChatSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        soundEnabled={soundEnabled}
        toggleSounds={toggleSounds}
        aiEnabled={aiEnabled}
        toggleAI={toggleAI}
        autoReplyDelay={autoReplyDelay}
        setAutoReplyDelay={setAutoReplyDelay}
        onExportChat={handleExportChat}
        onImportChat={handleImportChat}
        onClearHistory={handleClearHistory}
        aiStats={getAIStats()}
      />
    </motion.div>
  );
};

export default React.memo(ChatPage);