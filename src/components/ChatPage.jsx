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
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'me') {
      setIsTyping(true);
      
      const timer = setTimeout(() => {
        setIsTyping(false);
        
        const replyMessage = {
          id: messages.length + 1,
          text: getRandomResponse(),
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          reactions: []
        };
        
        setIsTyping(false);
        setMessages(prev => [...prev, replyMessage]);

      }, 2000 + Math.random() * 3000);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  const getRandomResponse = () => {
    const responses = [
      "Interesting! Tell me more.",
      "I'll get back to you on that.",
      "Thanks for letting me know!",
      "Can we discuss this later?",
      "I appreciate your message!",
      "Let me think about it...",
      "That's a good point!",
      "I'm currently busy, will reply properly later."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Scroll automatique
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Gestion de l'envoi de message
  const handleSend = (e, mediaToSend = []) => {
    e.preventDefault();
    
    // Ne pas envoyer de message vide s'il n'y a ni texte ni média
    if (!inputValue.trim() && mediaToSend.length === 0) return;

    // Créer le nouveau message
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      media: mediaToSend.map(media => ({
        type: media.type,
        url: media.url // Dans une vraie app, vous enverriez le fichier au serveur
      })),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: [],
      isRead: false
    };

    // Ajouter le message à la liste
    setMessages(prev => [...prev, newMessage]);
    
    // Réinitialiser l'input
    setInputValue('');
    setShowEmojiPicker(false);
    
    // Dans une vraie application, vous enverriez le message au serveur ici
    // await sendMessageToServer(newMessage);
    
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
  };
  // Gestion des emojis
  const onEmojiClick = (emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
    inputRef.current.focus();
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
      className={`flex-1 flex flex-col h-screen ${theme.bgColor} lg:border-l lg:border-r ${theme.borderColor} relative`}

    >
      <ChatHeader 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onStartCall={onStartCall}
        setShowSearch={setShowSearch}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        theme={theme}
        chatHeaderRef={chatHeaderRef }
        isTyping={isTyping}
        onProfileOpen={onProfileOpen}
      />

      {showSearch && (
        <ChatSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
        />
      )}

      <div 
  className={`flex-1 overflow-y-auto p-4 ${theme.bgColor} ${showSearch ? 'pt-2' : ''}`}
  onClick={() => {
    setShowEmojiPicker(false);
    setShowMenu(false);
  }}
  style={{
    backgroundImage: 'url("https://v1.ora-app.genesis-company.net/private/feb2e70fc34f45ffa03b73d9112cb73c/2024-10-10/67080dbd43dd83.21388693__i0.webp")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
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
    
    {isTyping ? (
      <TypingIndicator theme={theme} />
    ) : (
      <div ref={messagesEndRef} />
    )}
  </AnimatePresence>
</div>


      <EmojiPickerWrapper 
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={onEmojiClick}
        theme={theme}
      />

      <footer className={`p-1 border-t ${theme.borderColor} ${theme.headerBg} sticky bottom-0`}>
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          setShowEmojiPicker={setShowEmojiPicker}
          handleMediaUpload={handleMediaUpload}
          theme={theme}
          fileInputRef={fileInputRef}
        />
      </footer>

      <ChatMenu 
        showMenu={showMenu}
        theme={theme}
      />
    </motion.div>
  );
};

export default ChatPage;