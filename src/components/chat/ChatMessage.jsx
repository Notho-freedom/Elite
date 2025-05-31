import { useState } from 'react';
import { IoCheckmarkDone, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import MediaViewer from './MediaViewer';
import { BsCheck2All } from 'react-icons/bs';
import clsx from 'clsx';

const ChatMessage = ({ 
  message, 
  addReaction, 
  theme,
  variants
}) => {
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const displayedMedia = message.media?.slice(0, 4) || [];
  const extraMediaCount = message.media?.length > 4 ? message.media.length - 4 : 0;

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
        className={`mb-4 flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} px-2`}
      >
        <div className={`max-w-xs lg:max-w-md relative group ${message.sender === 'me' ? 'ml-10' : 'mr-10'}`}>
          {/* Bulle de message */}
          <div 
            className={`px-4 py-2 rounded-2xl relative ${
              message.sender === 'me' 
                ? `bg-[#007AFF] text-white rounded-br-none shadow-md shadow-blue-500/20`
                : `${theme.messageBg} rounded-bl-none ${theme.textColor} shadow-md shadow-gray-400/20 backdrop-blur-sm`
            }`}
          >
          {/* Triangle de la bulle */}
          <div className={`absolute top-0 w-3 h-3 ${
            message.sender === 'me' 
              ? 'right-0 -mr-3 bg-blue-500 clip-path-triangle-right'
              : 'left-0 -ml-3 bg-gray-100 clip-path-triangle-left'
          }`} 
          style={{
            filter: message.sender === 'me' ? 'none' : 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.05))'
          }}
          />

          <p className="text-sm leading-relaxed">{message.text}</p>
          {displayedMedia.length > 0 && (
  <div className={`mt-2 grid gap-2 ${
    displayedMedia.length === 1 ? 'grid-cols-1' :
    displayedMedia.length === 2 ? 'grid-cols-2' :
    'grid-cols-2 grid-rows-2'
  }`}>
    {displayedMedia.map((item, idx) => (
      <motion.div 
        key={idx}
        whileHover={{ scale: 1.02 }}
        className={`relative rounded-lg overflow-hidden cursor-pointer ${
          displayedMedia.length === 3 && idx === 0 ? 'row-span-2 h-full' : 
          displayedMedia.length === 1 ? 'max-w-[280px]' : ''
        }`}
        style={{
          aspectRatio: item.type === 'video' ? '16/9' : '1/1'
        }}
        onClick={() => openMediaViewer(idx)}
      >
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200 z-10" />
        
        {item.type === 'image' ? (
          <img 
            src={item.url} 
            alt="Media" 
            className="w-full h-full object-cover transition-transform duration-300"
          />
        ) : (
          <>
            <video className="w-full h-full object-cover">
              <source src={item.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/40 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.8L16 10l-9.7 7.2V2.8z"/>
                </svg>
              </div>
            </div>
          </>
        )}
      </motion.div>
    ))}

    {extraMediaCount > 0 && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-3 right-3 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium cursor-pointer"
        onClick={() => openMediaViewer(3)}
      >
        +{extraMediaCount}
      </motion.div>
    )}
  </div>
)}


          {/* Métadonnées du message */}
          <div className={`text-[11px] mt-1 flex items-center justify-end space-x-1 ${
            message.sender === 'me' ? 'text-blue-100' : theme.secondaryText
          }`}>
            <span>{message.time}</span>
            {message.sender === 'me' && (
              <BsCheck2All className={clsx(
                      "text-xs",
                      message.isRead ? "text-blue-600 dark:text-blue-300" : theme.secondaryText
                    )} />
            )}
          </div>
        </div>
        
        {/* Réactions existantes */}
        {message.reactions.length > 0 && (
          <div className={`flex justify-${message.sender === 'me' ? 'end' : 'start'} mt-1 space-x-1`}>
            {message.reactions.map((reaction, idx) => (
              <motion.div 
                key={idx}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  message.sender === 'me' ? 'bg-blue-600/80' : theme.bgColor
                } border ${
                  message.sender === 'me' ? 'border-blue-700/50' : theme.borderColor
                } shadow-sm backdrop-blur-sm`}
              >
                {reaction.emoji}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Menu de réactions */}
        <motion.div 
          className={`absolute ${message.sender === 'me' ? 'left-0' : 'right-0'} -top-6 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 p-1 rounded-full ${
            message.sender === 'me' ? 'bg-blue-500/10' : 'bg-gray-100/80'
          } backdrop-blur-md`}
          whileHover={{ scale: 1.05 }}
        >
          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addReaction(message.id, emoji)}
              className={`text-xs p-1 rounded-full ${
                message.sender === 'me' ? 'hover:bg-blue-500/20' : 'hover:bg-gray-200/80'
              } transition-colors`}
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
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