import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsCheck2All } from 'react-icons/bs';
import { FaReply, FaEdit } from 'react-icons/fa';
import clsx from 'clsx';
import MediaDisplay from '../MediaDisplay';
import LinkPreview from '../LinkPreview';
import MessageStates from './MessageStates';
import MessageDropdown from './MessageDropdown';
import { useMemo } from 'react';

const EnhancedMessageBubble = ({ 
  message, 
  theme, 
  openMediaViewer, 
  onMessageAction,
  currentUserId 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const isSingleEmoji = useMemo(() => 
    message.text?.match(/^\p{Emoji}$/u) && !message.media?.length,
    [message.text, message.media]
  );
  
  const isSingleMedia = useMemo(() => 
    message.media?.length === 1 && !message.text,
    [message.media, message.text]
  );

  const detectedLinks = useMemo(() => {
    if (!message.text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.text.match(urlRegex) || [];
  }, [message.text]);

  const formatText = useMemo(() => {
    if (!message.text) return null;
    
    return message.text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => (
      detectedLinks.includes(part) ? (
        <div key={index} className="w-full my-1 overflow-hidden rounded-lg">
          <LinkPreview url={part} theme={theme} sender={message.sender} />
        </div>
      ) : (
        <span 
          key={index} 
          className="whitespace-pre-wrap break-words inline"
          style={{ lineHeight: '1.4' }}
        >
          {part}
        </span>
      )
    ));
  }, [message.text, detectedLinks, theme, message.sender]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setDropdownPosition({ x: e.clientX, y: e.clientY });
    setShowDropdown(true);
  };

  const handleMessageAction = (action, messageData) => {
    if (onMessageAction) {
      onMessageAction(action, messageData);
    }
    setShowDropdown(false);
  };

  return (
    <>
      <div 
        className={clsx(
          'relative group cursor-pointer',
          isSingleEmoji && 'bg-transparent p-0',
          !isSingleEmoji && !isSingleMedia && [
            'rounded-2xl px-3 py-2 max-w-xs md:max-w-md lg:max-w-lg',
            message.sender === 'me' 
              ? `${theme.accentBg} text-white ml-auto` 
              : `${theme.messageBg} ${theme.textColor}`
          ],
          isSingleMedia && 'bg-transparent p-0 max-w-xs md:max-w-md'
        )}
        onContextMenu={handleContextMenu}
      >
        {/* Message en réponse à un autre */}
        {message.replyTo && (
          <div className={`
            mb-2 p-2 rounded-lg border-l-4 border-blue-500
            ${message.sender === 'me' ? 'bg-white/10' : theme.headerBg}
          `}>
            <div className={`text-xs font-medium mb-1 ${
              message.sender === 'me' ? 'text-white/80' : theme.secondaryText
            }`}>
              {message.replyTo.senderName || 'Contact'}
            </div>
            <div className={`text-sm ${
              message.sender === 'me' ? 'text-white/70' : theme.secondaryText
            } truncate`}>
              {message.replyTo.text || 'Média'}
            </div>
          </div>
        )}

        {/* États du message */}
        <MessageStates 
          message={message} 
          theme={theme} 
          className="absolute -top-2 right-2 z-10" 
        />

        {/* Contenu principal */}
        {isSingleEmoji ? (
          <div className="text-4xl">{message.text}</div>
        ) : (
          <>
            {/* Média */}
            {message.media?.length > 0 && (
              <div className={clsx(
                'relative',
                !isSingleMedia && 'mb-2',
                isSingleMedia && 'rounded-2xl overflow-hidden'
              )}>
                <MediaDisplay 
                  media={message.media} 
                  isSingleMedia={isSingleMedia}
                  openMediaViewer={openMediaViewer}
                />
              </div>
            )}

            {/* Texte formaté */}
            {formatText && (
              <div className={clsx(
                'text-sm',
                message.sender === 'me' ? 'text-white' : theme.textColor
              )}>
                {formatText}
              </div>
            )}

            {/* Métadonnées du message */}
            <div className={clsx(
              'flex items-center justify-end gap-1 mt-1 text-xs',
              message.sender === 'me' ? 'text-white/70' : theme.secondaryText
            )}>
              {/* Heure d'édition si modifié */}
              {message.isEdited && (
                <span className="flex items-center gap-1">
                  <FaEdit className="w-3 h-3" />
                  modifié
                </span>
              )}
              
              {/* Heure */}
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>

              {/* Statut de lecture (messages envoyés uniquement) */}
              {message.sender === 'me' && (
                <BsCheck2All 
                  className={clsx(
                    'w-4 h-4',
                    message.isRead ? 'text-blue-400' : 'text-white/50'
                  )} 
                />
              )}
            </div>
          </>
        )}

        {/* Boutons d'action rapide (visibles au hover) */}
        <div className={clsx(
          'absolute -top-8 right-0 opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200 flex items-center gap-1',
          'bg-black/80 rounded-full px-2 py-1'
        )}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMessageAction('reply', message)}
            className="p-1 text-white hover:text-blue-400 transition-colors"
            title="Répondre"
          >
            <FaReply className="w-3 h-3" />
          </motion.button>
          
          {message.sender === 'me' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMessageAction('edit', message)}
              className="p-1 text-white hover:text-orange-400 transition-colors"
              title="Modifier"
            >
              <FaEdit className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Dropdown de contexte */}
      <MessageDropdown
        message={message}
        theme={theme}
        position={dropdownPosition}
        isVisible={showDropdown}
        onClose={() => setShowDropdown(false)}
        onAction={handleMessageAction}
      />
    </>
  );
};

export default EnhancedMessageBubble;
