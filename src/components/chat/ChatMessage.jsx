// ChatMessage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import MessageReactions from './MessageReactions';
import ReactionMenu from './ReactionMenu';
import MediaViewer from './MediaViewer';

const ChatMessage = ({ 
  message, 
  addReaction, 
  theme,
  variants,
  currentUserId
}) => {
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const openMediaViewer = (index) => {
    setSelectedMediaIndex(index);
    setMediaViewerOpen(true);
  };

  return (
    <>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
        className={`mb-3 flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} px-2`}
      >
        <div 
          className={`relative group ${message.sender === 'me' ? 'ml-10' : 'mr-10'} ${
            message.media?.length === 1 && !message.text ? 'flex justify-end' : ''
          }`}
          style={{ 
            minWidth: '120px',
            maxWidth: (message.media?.length === 1 && !message.text) ? 'none' : '30vw'
          }}
        >
          <MessageBubble 
            message={message} 
            theme={theme} 
            currentUserId={currentUserId}
            openMediaViewer={openMediaViewer}
          />
          
          <MessageReactions 
            message={message} 
            currentUserId={currentUserId} 
            theme={theme}
          />
          
          <ReactionMenu 
            message={message} 
            addReaction={addReaction} 
            currentUserId={currentUserId}
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