import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from './Context/ThemeContext';
import {motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatSearch from './chat/ChatSearch';
import ChatMenu from './chat/ChatMenu';
import EmojiPickerWrapper from './chat/EmojiPickerWrapper';
import TypingIndicator from './chat/TypingIndicator';
import { askGroq } from './IA/AIResponse';

const ChatPage = ({ activeChat, setActiveChat, messages: initialMessages, onStartCall, setActiveTab, onProfileOpen }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatHeaderRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const media = files.map(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      return { type, url };
    });
  
    const newMessage = {
      id: Date.now(),
      text: '',
      sender: 'me',
      media,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: []
    };
  
    setMessages(prev => [...prev, newMessage]);
    e.target.value = ''; // Reset input
  };
  
  // Messages initiaux avec gestion des messages existants
  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) {
      const defaultMessages = [
        { 
          id: 1, 
          text: 'Hey there! How are you?', 
          sender: 'them', 
          time: '10:30 AM', 
          status: 'read',
          reactions: []
        },
        { 
          id: 2, 
          text: 'I was just thinking about our project', 
          sender: 'them', 
          time: '10:31 AM', 
          status: 'read',
          reactions: []
        }
      ];
      
      if (activeChat?.lastMessage) {
        defaultMessages.push({
          id: 3,
          text: activeChat.lastMessage,
          sender: 'me',
          time: activeChat.timeDisplay,
          status: 'read',
          reactions: []
        });
      }
      
      setMessages(defaultMessages);
    }
  }, [initialMessages, activeChat]);

  // Auto-réponse et effet "typing"
// Dans l'effet de réponse automatique
useEffect(() => {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage && lastMessage.sender === 'me' && lastMessage.text && activeChat.isOnline) {
    setIsTyping(true);

    const simulateResponse = async () => {
      try {
        const aiReply = await askGroq(lastMessage.text, activeChat); // Passez activeChat

        const replyMessage = {
          id: Date.now(),
          text: aiReply,
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: []
        };

        setMessages(prev => [...prev, replyMessage]);
      } catch (err) {
        console.error('Erreur de réponse IA :', err);
      } finally {
        setIsTyping(false);
      }
    };

    const timer = setTimeout(simulateResponse, 2000 + Math.random() * 3000);
    return () => clearTimeout(timer);
  }
}, [messages, activeChat]); // Ajoutez activeChat aux dépendances

  // Scroll automatique
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

// Dans ChatPage.js
const handleSend = useCallback((e, { message, media = [] }) => {
  e?.preventDefault(); // e peut être undefined quand appelé depuis MediaPreviewModal
  
  // Ne pas envoyer de message vide s'il n'y a ni texte ni média
  if (!message?.trim() && media.length === 0) return;

  const newMessage = {
    id: Date.now(),
    text: message || '',
    media: media,
    sender: 'me',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent',
    reactions: [],
    isRead: false
  };

  setMessages(prev => [...prev, newMessage]);
  
  // Réinitialiser l'input
  setInputValue('');
  setShowEmojiPicker(false);
  
  // Simuler l'envoi et la lecture
  setTimeout(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
    ));
  }, 1000);
  
  setTimeout(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === newMessage.id ? { ...msg, status: 'read', isRead: true } : msg
    ));
  }, 2000);
}, []);

  // Gestion des emojis
  const onEmojiClick = (emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
  };

  // Ajouter une réaction à un message
  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === reaction);
        
        if (existingReactionIndex >= 0) {
          // Retirer la réaction si elle existe déjà
          const updatedReactions = [...msg.reactions];
          updatedReactions.splice(existingReactionIndex, 1);
          return { ...msg, reactions: updatedReactions };
        } else {
          // Ajouter la réaction
          return { 
            ...msg, 
            reactions: [...msg.reactions, { 
              emoji: reaction, 
              count: 1 
            }]
          };
        }
      }
      return msg;
    }));
  };

  // Animation des messages
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 50 },
  };

  // Messages filtrés pour la recherche
  const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <motion.div 
      className={`flex flex-col h-screen lg:border-l lg:border-r ${theme.borderColor} relative`}
      style={{
        backgroundImage: 'url("https://images5.alphacoders.com/133/thumb-1920-1339662.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header fixe en haut */}
      <ChatHeader 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onStartCall={onStartCall}
        setShowSearch={setShowSearch}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        theme={theme}
        chatHeaderRef={chatHeaderRef}
        isTyping={isTyping}
        onProfileOpen={onProfileOpen}
      />
  
      {/* Zone de recherche (conditionnelle) */}
      {showSearch && (
        <ChatSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
        />
      )}
  
      {/* Zone des messages avec défilement */}
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
              key={message.id}
              message={message}
              addReaction={addReaction}
              theme={theme}
              variants={messageVariants}
            />
          ))}
          
          {isTyping? <TypingIndicator theme={theme} /> : <div ref={messagesEndRef} className="h-4" />}
          
        </AnimatePresence>
      </div>
  
      {/* Picker d'emojis flottant */}
      <EmojiPickerWrapper 
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={onEmojiClick}
        theme={theme}
      />
  
      {/* Footer fixe en bas */}
      <footer className={`
        sticky bottom-0 p-2 px-4 shadow-lg`}>
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          setShowEmojiPicker={setShowEmojiPicker}
          handleMediaUpload={handleMediaUpload}
          theme={theme}
          fileInputRef={fileInputRef}
          recipient={activeChat}
        />
      </footer>
  
      {/* Menu flottant (conditionnel) */}
      {showMenu && (
        <ChatMenu 
          showMenu={showMenu}
          theme={theme}
        />
      )}
    </motion.div>
  );
};

export default ChatPage;