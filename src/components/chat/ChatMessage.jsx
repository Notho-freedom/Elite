import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheck2All } from 'react-icons/bs';
import clsx from 'clsx';
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

  const displayedMedia = message.media?.slice(0, 4) || [];
  const extraMediaCount = message.media?.length > 4 ? message.media.length - 4 : 0;

  const isSingleEmoji = message.text && message.text.match(/^\p{Emoji}$/u) && !message.media?.length;
  const isSingleMedia = message.media?.length === 1 && !message.text;
  const isSingleImage = isSingleMedia && displayedMedia[0]?.type === 'image';
  const isSingleVideo = isSingleMedia && displayedMedia[0]?.type === 'video';

  // Gestion des réactions uniques par utilisateur
  const userReaction = message.reactions.find(r => r.userId === currentUserId);
  const otherReactions = message.reactions.filter(r => r.userId !== currentUserId);
  const allReactions = userReaction ? [userReaction, ...otherReactions] : otherReactions;

  const handleAddReaction = (emoji) => {
    // Si l'utilisateur a déjà une réaction, on la remplace
    if (userReaction) {
      // On supprime d'abord l'ancienne réaction
      addReaction(message.id, userReaction.emoji, true);
    }
    // Puis on ajoute la nouvelle
    addReaction(message.id, emoji);
  };

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
            isSingleMedia ? 'flex justify-end' : ''
          }`}
          style={{ 
            minWidth: '120px',
            maxWidth: isSingleMedia ? 'none' : '30vw'
          }}
        >
          {/* Message bubble */}
          <div 
            className={`relative ${
              isSingleEmoji 
                ? 'bg-transparent text-5xl p-0' 
                : isSingleMedia
                  ? 'p-0 rounded-xl overflow-hidden'
                  : `px-3 py-2 rounded-2xl ${
                      message.sender === 'me' 
                        ? 'bg-[#007AFF] text-white rounded-br-none shadow-md shadow-blue-500/20'
                        : `${theme.messageBg} rounded-bl-none ${theme.textColor} shadow-md shadow-gray-400/20 backdrop-blur-sm`
                    }`
            } ${isSingleImage ? 'max-w-[320px]' : ''}`}
          >
            {/* Speech bubble triangle - only for text messages */}
            {!isSingleEmoji && !isSingleMedia && (
              <div className={`absolute top-0 w-3 h-3 ${
                message.sender === 'me' 
                  ? 'right-0 -mr-3 bg-[#007AFF] clip-path-triangle-right'
                  : 'left-0 -ml-3 bg-gray-100 clip-path-triangle-left'
              }`} 
              style={{
                filter: message.sender === 'me' ? 'none' : 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.05))'
              }}
              />
            )}

            {/* Message text */}
            {!isSingleMedia && message.text && (
              <p className={`${isSingleEmoji ? '' : 'text-sm leading-snug break-words'}`}>
                {message.text}
              </p>
            )}

            {/* Media display */}
            {displayedMedia.length > 0 && (
              <div className={clsx(
                isSingleMedia ? '' : 'mt-1',
                {
                  'w-[280px] h-[280px]': isSingleImage,
                  'w-[280px]': isSingleVideo,
                  'grid gap-1': !isSingleMedia,
                  'grid-cols-1': !isSingleMedia && displayedMedia.length === 1,
                  'grid-cols-2': !isSingleMedia && (displayedMedia.length === 2 || displayedMedia.length >= 3),
                  'grid-rows-2': !isSingleMedia && displayedMedia.length >= 3
                }
              )}>
                {displayedMedia.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className={clsx(
                      'relative rounded-lg overflow-hidden cursor-pointer',
                      {
                        'row-span-2 h-full': displayedMedia.length === 3 && idx === 0,
                        'max-w-[280px]': displayedMedia.length === 1 && !isSingleMedia,
                        'h-full': isSingleVideo
                      }
                    )}
                    style={{
                      aspectRatio: item.type === 'video' ? '16/9' : isSingleImage ? '1/1' : '1/1'
                    }}
                    onClick={() => openMediaViewer(idx)}
                  >
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200 z-10" />
                    
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt="Media" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video 
                          className="w-full h-full object-cover"
                          disablePictureInPicture
                          preload="metadata"
                        >
                          <source src={item.url} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/40 rounded-full p-2">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.8L16 10l-9.7 7.2V2.8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {extraMediaCount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium cursor-pointer"
                    onClick={() => openMediaViewer(3)}
                  >
                    +{extraMediaCount}
                  </motion.div>
                )}
              </div>
            )}

            {/* Metadata - positioned absolutely for single media to avoid extra space */}
            {!isSingleEmoji && (
              <div className={clsx(
                `text-[11px] flex items-center justify-end space-x-1 ${
                  message.sender === 'me' ? 'text-blue-100' : theme.secondaryText
                }`,
                {
                  'mt-0.5': !isSingleMedia,
                  'absolute bottom-1 right-1 bg-black/60 px-1 rounded': isSingleMedia
                }
              )}>
                <span>{message.time}</span>
                {message.sender === 'me' && (
                  <BsCheck2All className={clsx(
                    "text-xs",
                    message.isRead ? "text-blue-300" : "opacity-70"
                  )} />
                )}
              </div>
            )}
          </div>
          
          {/* Reactions - always displayed below the message */}
          {allReactions.length > 0 && (
            <div className={`flex justify-${
              message.sender === 'me' ? 'end' : 'start'
            } mt-1 w-full ${
              isSingleMedia ? 'absolute bottom-0 translate-y-full' : ''
            }`}>
              <div className="flex space-x-1">
                {allReactions.map((reaction, idx) => (
                  <motion.div 
                    key={`${reaction.userId}-${idx}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      reaction.userId === currentUserId 
                        ? message.sender === 'me' 
                          ? 'bg-blue-600/90' 
                          : 'bg-gray-300/90'
                        : message.sender === 'me' 
                          ? 'bg-blue-600/50' 
                          : 'bg-gray-200/80'
                    } border ${
                      message.sender === 'me' ? 'border-blue-700/50' : theme.borderColor
                    } shadow-sm backdrop-blur-sm`}
                  >
                    {reaction.emoji}
                    {reaction.count > 1 && (
                      <span className="ml-1 text-[10px]">
                        {reaction.count}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reaction menu */}
          <motion.div 
            className={`absolute ${message.sender === 'me' ? 'left-0' : 'right-0'} -top-5 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-0.5 p-0.5 rounded-full ${
              message.sender === 'me' ? 'bg-blue-500/10' : 'bg-gray-100/80'
            } backdrop-blur-md`}
            whileHover={{ scale: 1.05 }}
          >
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAddReaction(emoji)}
                className={`text-xs p-0.5 rounded-full ${
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