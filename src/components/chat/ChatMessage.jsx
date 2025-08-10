// ChatMessage.jsx
import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsThreeDotsVertical, 
  BsReply, 
  BsCheck2All, 
  BsCheck2, 
  BsClock,
  BsPin,
  BsStar,
  BsCopy,
  BsTrash,
  BsDownload,
  BsEye,
  BsEyeSlash,
  BsForward,
  BsLink45Deg,
  BsImage,
  BsFileText,
  BsMic,
  BsPlay,
  BsPause
} from 'react-icons/bs';
import { FiEdit2, FiMapPin, FiSmile } from 'react-icons/fi';

const ChatMessage = memo(({ 
  message, 
  theme, 
  currentUserId,
  isAuthenticated,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onPin,
  onReaction,
  showAvatar = true,
  showTime = true
}) => {
  // États locaux
  const [showActions, setShowActions] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Références
  const messageRef = useRef(null);
  const actionsRef = useRef(null);
  const longPressTimerRef = useRef(null);

  // Propriétés calculées
  const isOwn = message.isOwn || message.sender === 'me' || message.senderId === currentUserId;
  const hasReactions = message.reactions && message.reactions.length > 0;
  const hasMedia = message.media_url || message.type !== 'text';
  const isEdited = message.is_edited || message.isEdited;
  const isPinned = message.is_pinned || message.isPinned;
  const isImportant = message.is_important || message.isImportant;

  // Contenu du message
  const messageContent = message.content || message.text || '';
  const messageTime = message.time || new Date(message.timestamp || message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Détection des liens
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const hasLinks = linkRegex.test(messageContent);

  // Formatage du contenu avec liens
  const formatContentWithLinks = (content) => {
    if (!hasLinks) return content;
    
    return content.split(linkRegex).map((part, index) => {
      if (linkRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Gestion des touches longues (mobile)
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowActions(true);
      navigator.vibrate?.(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Nettoyer les timers
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Fermer les menus en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
        setShowReactionMenu(false);
      }
    };

    if (showActions || showReactionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions, showReactionMenu]);

  // Icône de statut du message
  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case 'sending':
        return <BsClock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <BsCheck2 className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <BsCheck2All className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <BsCheck2All className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <BsEyeSlash className="w-3 h-3 text-red-500" />;
      default:
        return <BsCheck2 className="w-3 h-3 text-gray-400" />;
    }
  };

  // Composant de média
  const MediaComponent = () => {
    if (!hasMedia) return null;

    const mediaType = message.media_type || message.type;
    const mediaUrl = message.media_url;
    const thumbnailUrl = message.thumbnail_url;

    switch (mediaType) {
      case 'image':
        return (
          <div className="relative max-w-sm rounded-lg overflow-hidden cursor-pointer">
            <img
              src={imageError ? '/placeholder-image.png' : (thumbnailUrl || mediaUrl)}
              alt="Image partagée"
              className="w-full h-auto object-cover"
              onError={() => setImageError(true)}
              onClick={() => setShowFullImage(true)}
              loading="lazy"
            />
            {showFullImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={() => setShowFullImage(false)}
              >
                <img
                  src={mediaUrl}
                  alt="Image en plein écran"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setShowFullImage(false)}
                  className="absolute top-4 right-4 text-white text-2xl hover:opacity-80"
                >
                  ×
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative max-w-sm rounded-lg overflow-hidden">
            <video
              src={mediaUrl}
              poster={thumbnailUrl}
              controls
              className="w-full h-auto"
              preload="metadata"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? <BsPause className="w-4 h-4" /> : <BsPlay className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {message.media_name || 'Message vocal'}
              </div>
              <div className="text-xs text-gray-500">
                {message.media_size ? `${Math.round(message.media_size / 1024)} KB` : 'Audio'}
              </div>
            </div>
            <BsMic className="w-4 h-4 text-gray-400" />
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
              <BsFileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {message.media_name || 'Fichier'}
              </div>
              <div className="text-xs text-gray-500">
                {message.media_size ? `${Math.round(message.media_size / 1024)} KB` : 'Document'}
              </div>
            </div>
            <a
              href={mediaUrl}
              download={message.media_name}
              className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <BsDownload className="w-4 h-4" />
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  // Composant de réponse
  const ReplyComponent = () => {
    if (!message.reply_to && !message.replyTo) return null;

    const replyData = message.reply_to || message.replyTo;
    
    return (
      <div className="mb-2 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
        <div className="text-xs text-gray-500 mb-1">
          Réponse à {replyData.sender || replyData.senderName || 'Utilisateur'}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {replyData.content || replyData.text}
        </div>
      </div>
    );
  };

  // Composant de mentions
  const MentionsComponent = () => {
    if (!message.mentions || message.mentions.length === 0) return null;

    return (
      <div className="text-xs text-blue-500 mb-1">
        @{message.mentions.join(' @')}
      </div>
    );
  };

  // Composant de localisation
  const LocationComponent = () => {
    if (!message.location) return null;

    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
        <FiMapPin className="w-5 h-5 text-red-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Position partagée
          </div>
          <div className="text-xs text-gray-500">
            {message.location.address || `${message.location.lat}, ${message.location.lng}`}
          </div>
        </div>
      </div>
    );
  };

  // Composant de réactions
  const ReactionsComponent = () => {
    if (!hasReactions) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {message.reactions.map((reaction, index) => (
          <motion.button
            key={`${reaction.emoji}-${index}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onReaction && onReaction(reaction.emoji)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span>{reaction.emoji}</span>
            <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
          </motion.button>
        ))}
        
        {/* Bouton ajouter réaction */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowReactionMenu(!showReactionMenu)}
          className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiSmile className="w-3 h-3" />
        </motion.button>
      </div>
    );
  };

  // Menu de réactions rapides
  const QuickReactionMenu = () => {
    if (!showReactionMenu) return null;

    const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-20"
      >
        {quickEmojis.map(emoji => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onReaction && onReaction(emoji);
              setShowReactionMenu(false);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    );
  };

  // Actions du message
  const ActionsMenu = () => {
    if (!showActions) return null;

    const actions = [
      { icon: BsReply, label: 'Répondre', action: () => onReply && onReply(message) },
      { icon: BsCopy, label: 'Copier', action: () => onCopy && onCopy(message) },
      ...(isOwn ? [
        { icon: FiEdit2, label: 'Modifier', action: () => onEdit && onEdit(message) },
        { icon: BsTrash, label: 'Supprimer', action: () => onDelete && onDelete(message), danger: true }
      ] : []),
      { icon: BsPin, label: isPinned ? 'Désépingler' : 'Épingler', action: () => onPin && onPin(message) },
      { icon: BsForward, label: 'Transférer', action: () => {} },
      { icon: BsStar, label: isImportant ? 'Retirer importance' : 'Marquer important', action: () => {} }
    ];

    return (
      <motion.div
        ref={actionsRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-48 z-20`}
      >
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ x: isOwn ? -4 : 4 }}
            onClick={() => {
              action.action();
              setShowActions(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              action.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-sm">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group relative`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="flex items-end gap-2 mb-1">
            <img
              src={message.avatar || 'https://via.placeholder.com/32'}
              alt={message.senderName || message.sender}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-xs text-gray-500 font-medium">
              {message.senderName || message.sender}
            </div>
          </div>
        )}

        {/* Bulles de message */}
        <div className={`relative ${!isOwn && showAvatar ? 'ml-10' : ''}`}>
          {/* Indicateurs spéciaux */}
          <div className="flex items-center gap-1 mb-1">
            {isPinned && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <BsPin className="w-3 h-3" />
                <span>Épinglé</span>
              </div>
            )}
            {isImportant && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <BsStar className="w-3 h-3" />
                <span>Important</span>
              </div>
            )}
          </div>

          <div
            className={`relative p-3 rounded-2xl ${
              isOwn
                ? 'bg-blue-500 text-white ml-auto'
                : `${theme.bgSecondary} ${theme.textColor} border ${theme.borderColor}`
            } ${isPinned ? 'ring-2 ring-yellow-300' : ''} ${isImportant ? 'ring-2 ring-red-300' : ''}`}
          >
            {/* Contenu du message */}
            <div className="space-y-2">
              <MentionsComponent />
              <ReplyComponent />
              
              {/* Texte principal */}
              {messageContent && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {formatContentWithLinks(messageContent)}
                </div>
              )}

              {/* Médias */}
              <MediaComponent />
              
              {/* Localisation */}
              <LocationComponent />
            </div>

            {/* Informations du message */}
            <div className={`flex items-center justify-between mt-2 text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-2">
                {isEdited && (
                  <span className="italic">modifié</span>
                )}
                {showTime && (
                  <span>{messageTime}</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {getStatusIcon()}
              </div>
            </div>

            {/* Bouton actions */}
            <button
              onClick={() => setShowActions(!showActions)}
              className={`absolute top-2 ${isOwn ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 p-1 rounded-full ${
                isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              } hover:bg-opacity-80 transition-all duration-200`}
            >
              <BsThreeDotsVertical className="w-3 h-3" />
            </button>

            <ActionsMenu />
          </div>

          {/* Réactions */}
          <div className="relative">
            <ReactionsComponent />
            <QuickReactionMenu />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;