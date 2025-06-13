import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './Context/AppContext';
import useChatMessages from './hooks/useChatMessages';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatSearch from './chat/ChatSearch';
import ChatMenu from './chat/ChatMenu';
import EmojiPickerWrapper from './chat/EmojiPickerWrapper';
import TypingIndicator from './chat/TypingIndicator';

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
  } = useChatMessages();

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

  return (
    <motion.div 
      className={`flex flex-col h-screen lg:border-l lg:border-r ${theme.borderColor} relative`}
      style={backgroundStyles}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
        }}
      >
        <AnimatePresence>
          {(searchQuery ? filteredMessages : messages).map((message) => (
            <ChatMessage 
              key={`msg-${message.id}-${message.time}`}
              message={message}
              addReaction={addReaction}
              theme={theme}
              variants={messageVariants}
              activeChat={activeChat}
            />
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
    </motion.div>
  );
};

export default React.memo(ChatPage);