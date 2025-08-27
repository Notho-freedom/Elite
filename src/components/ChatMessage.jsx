// ChatMessage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './chat/MessageBubble';
import MessageReactions from './chat/MessageReactions';
import ReactionMenu from './chat/ReactionMenu';
import MediaViewer from './chat/MediaViewer';
import { useApp } from './Context/AppContext';

const ChatMessage = ({ 
  message, 
  addReaction, 
  theme,
  variants
}) => {
  const { user } = useApp();
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const openMediaViewer = (index) => {
    setSelectedMediaIndex(index);
    setMediaViewerOpen(true);
  };

  // Déterminer si le message est de l'utilisateur actuel
  const isOwnMessage = message.senderId === user?.uid;

  // Transformer le message pour le format attendu par MessageBubble
  const transformedMessage = {
    id: message.id,
    text: message.text,
    media: message.media || [],
    sender: isOwnMessage ? 'me' : 'them',
    time: message.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '12:00',
    status: message.status || 'sent',
    reactions: message.reactions || [],
    isRead: message.readBy?.includes(user?.uid) || false
  };

  return (
    <>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-2`}
      >
        <div 
          className={`relative group ${isOwnMessage ? 'ml-10' : 'mr-10'} ${
            message.media?.length === 1 && !message.text ? 'flex justify-end' : 'lg:max-w-[40%] md:max-w-[75%] sm:max-w-[85%]'
          }`}
          style={{ 
            minWidth: '120px',
          }}
        >
          <MessageBubble 
            message={transformedMessage} 
            theme={theme} 
            currentUserId={user?.uid}
            openMediaViewer={openMediaViewer}
          />
          
          <MessageReactions 
            message={transformedMessage} 
            currentUserId={user?.uid} 
            theme={theme}
          />
          
          <ReactionMenu 
            message={transformedMessage} 
            addReaction={addReaction} 
            currentUserId={user?.uid}
            theme={theme}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {mediaViewerOpen && message.media && (
          <MediaViewer
            media={message.media} 
            onClose={() => setMediaViewerOpen(false)}
            initialIndex={selectedMediaIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatMessage;
