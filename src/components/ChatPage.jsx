import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from './Context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { useLocalStorage } from 'usehooks-ts';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatSearch from './chat/ChatSearch';
import ChatMenu from './chat/ChatMenu';
import EmojiPickerWrapper from './chat/EmojiPickerWrapper';
import TypingIndicator from './chat/TypingIndicator';
import { askGroq } from './IA/AIResponse';

// Sons (à placer dans public/sounds/)
const SOUNDS = {
  SEND: '/Sounds/pop.mp3',
  RECEIVE: '/Sounds/recieve.mp3',
  TYPING: ''
};

const ChatPage = ({ activeChat, setActiveChat, messages: initialMessages, onStartCall, onProfileOpen }) => {
  const { theme } = useTheme();
  // États
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('chatSoundsEnabled', true);
  
  // Réfs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatHeaderRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Sons optimisés
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

  // Initialisation des messages
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

  // Auto-réponse avec effets sonores
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    let typingTimeout;

    if (lastMessage?.sender === 'me' && lastMessage?.text && activeChat.isOnline) {
      setIsTyping(true);
      //if (soundEnabled) playTypingSound();

      const simulateResponse = async () => {
        try {
          // Délai avant début de réponse (plus naturel)
          await new Promise(resolve => setTimeout(resolve, 800));
          
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

      typingTimeout = setTimeout(simulateResponse, 1500 + Math.random() * 2000);
    }

    return () => {
      clearTimeout(typingTimeout);
      //stopTypingSound();
    };
  }, [messages, activeChat, soundEnabled, playTypingSound, stopTypingSound, playReceiveSound]);

  // Gestion de l'envoi de message avec sons
  const handleSend = useCallback((e, { message, media = [] }) => {
    e?.preventDefault();
    
    if (!message?.trim() && media.length === 0) return;

    // Feedback sonore
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
    const deliveryTimeline = [
      { delay: 800, status: 'delivered' },
      { delay: 1600, status: 'read', isRead: true }
    ];

    deliveryTimeline.forEach(({ delay, status, isRead }) => {
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status, ...(isRead && { isRead }) } 
            : msg
        ));

      }, delay);
    });
  }, [soundEnabled, playSendSound]);

  // Gestion des médias
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
    if (soundEnabled) playSendSound();
    e.target.value = '';
  };

  // Scroll automatique optimisé
  useEffect(() => {
    const scroll = () => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    };
    
    const scrollTimeout = setTimeout(scroll, 50);
    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  // Toggle des sons
  const toggleSounds = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) playReceiveSound(); // Feedback audio
  };

  // Autres fonctions
  const onEmojiClick = (emojiData) => {
    setInputValue(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(r => r.emoji === reaction);
        
        if (existingReactionIndex >= 0) {
          const updatedReactions = [...msg.reactions];
          updatedReactions.splice(existingReactionIndex, 1);
          return { ...msg, reactions: updatedReactions };
        } else {
          return { 
            ...msg, 
            reactions: [...msg.reactions, { emoji: reaction, count: 1 }]
          };
        }
      }
      return msg;
    }));
  };

  // Animations
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 50 },
  };

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
      }}
    >
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
        soundEnabled={soundEnabled}
        toggleSounds={toggleSounds}
      />
  
      {showSearch && (
        <ChatSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
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
          
          {isTyping? <TypingIndicator key="typing-indicator" theme={theme} />:<div key="messages-end" ref={messagesEndRef} className="h-4" />}
          
        </AnimatePresence>
      </div>
  
      <EmojiPickerWrapper 
        showEmojiPicker={showEmojiPicker}
        onEmojiClick={onEmojiClick}
        theme={theme}
      />
  
      <footer className="sticky bottom-0 p-2 px-4 shadow-lg">
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          setShowEmojiPicker={setShowEmojiPicker}
          handleMediaUpload={handleMediaUpload}
          theme={theme}
          fileInputRef={fileInputRef}
          recipient={activeChat}
          inputRef={inputRef}
          soundEnabled={soundEnabled}
          toggleSounds={toggleSounds}
        />
      </footer>
  
      {showMenu && (
        <ChatMenu 
          showMenu={showMenu}
          theme={theme}
          soundEnabled={soundEnabled}
          toggleSounds={toggleSounds}
        />
      )}
    </motion.div>
  );
};

export default ChatPage;