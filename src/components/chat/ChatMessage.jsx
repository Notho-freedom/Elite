// ChatMessage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsThreeDotsVertical, 
  BsReply, 
  BsCheck2All, 
  BsCheck2, 
  BsClock,
  BsPencil,
  BsTrash,
  BsPin,
  BsStar,
  BsCopy,
  BsShare,
  BsExclamationTriangle
} from 'react-icons/bs';
import { FiEdit2, FiMoreHorizontal } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import MessageReactions from './MessageReactions';
import MediaDisplay from './MediaDisplay';
import LinkPreview from './LinkPreview';
import ReactionMenu from './ReactionMenu';

const ChatMessage = ({ 
  message, 
  addReaction, 
  theme,
  variants,
  activeChat,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onMarkImportant,
  onCopy,
  onForward
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showMenu, setShowMenu] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  
  const messageRef = useRef(null);
  const editInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  
  const isMe = message.sender === 'me';
  const hasReactions = message.reactions && message.reactions.length > 0;

  // Gestion de l'édition
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Détection des liens
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const hasLinks = linkRegex.test(message.text);

  // Gestion du long press pour mobile
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressed(true);
      setShowMenu(true);
      navigator.vibrate?.(50); // Vibration tactile
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    setIsLongPressed(false);
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Actions du message
  const handleEdit = () => {
    if (isMe) {
      setIsEditing(true);
      setShowMenu(false);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.text) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Formatage du texte avec mentions
  const formatTextWithMentions = (text) => {
    if (!text) return text;
    
    return text.replace(/@(\w+)/g, (match, username) => (
      `<span class="mention bg-blue-100 text-blue-800 px-1 rounded">${match}</span>`
    ));
  };

  // Indicateur de statut
  const StatusIcon = () => {
    if (!isMe) return null;
    
    switch (message.status) {
      case 'sending':
        return <BsClock className="text-gray-400 text-xs" />;
      case 'sent':
        return <BsCheck2 className="text-gray-400 text-xs" />;
      case 'delivered':
        return <BsCheck2All className="text-gray-400 text-xs" />;
      case 'read':
        return <BsCheck2All className="text-blue-500 text-xs" />;
      default:
        return null;
    }
  };

  // Menu d'actions
  const ActionMenu = () => (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className={`absolute z-50 ${isMe ? 'right-0' : 'left-0'} top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]`}
        >
          <button
            onClick={() => { onReply?.(message); setShowMenu(false); }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <BsReply className="text-blue-500" />
            Répondre
          </button>
          
          {isMe && (
            <button
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
            >
              <BsPencil className="text-green-500" />
              Modifier
            </button>
          )}
          
          <button
            onClick={() => { onCopy?.(message.text); setShowMenu(false); }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <BsCopy className="text-gray-500" />
            Copier
          </button>
          
          <button
            onClick={() => { onPin?.(message.id); setShowMenu(false); }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <BsPin className={message.isPinned ? "text-yellow-500" : "text-gray-500"} />
            {message.isPinned ? 'Désépingler' : 'Épingler'}
          </button>
          
          <button
            onClick={() => { onMarkImportant?.(message.id); setShowMenu(false); }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <BsStar className={message.isImportant ? "text-yellow-500" : "text-gray-500"} />
            {message.isImportant ? 'Retirer important' : 'Marquer important'}
          </button>
          
          <button
            onClick={() => { onForward?.(message.id); setShowMenu(false); }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <BsShare className="text-blue-500" />
            Transférer
          </button>
          
          {isMe && (
            <button
              onClick={() => { onDelete?.(message.id); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-red-500"
            >
              <BsTrash />
              Supprimer
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
      <motion.div
      ref={messageRef}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
      className={`mb-3 relative group ${isMe ? 'ml-auto' : 'mr-auto'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        if (!showMenu) setShowMenu(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicateur de message épinglé */}
      {message.isPinned && (
        <div className={`text-xs text-yellow-600 mb-1 ${isMe ? 'text-right' : 'text-left'}`}>
          <BsPin className="inline mr-1" />
          Message épinglé
        </div>
      )}

      {/* Indicateur de message important */}
      {message.isImportant && (
        <div className={`text-xs text-yellow-600 mb-1 ${isMe ? 'text-right' : 'text-left'}`}>
          <BsStar className="inline mr-1" />
          Important
        </div>
      )}

      {/* Référence à un message (réponse) */}
      {message.replyTo && (
        <div className={`text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mb-1 border-l-2 border-blue-500 ${isMe ? 'ml-8' : 'mr-8'}`}>
          <div className="text-gray-600 dark:text-gray-400">
            Réponse à un message
          </div>
        </div>
      )}

      <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar pour les messages des autres */}
        {!isMe && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={activeChat?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
              alt={activeChat?.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`relative max-w-[75%] ${isMe ? 'ml-8' : 'mr-8'}`}>
          {/* Bulle de message principal */}
          <div className="relative">
            {isEditing ? (
              <div className={`${theme.messageMe} ${theme.textColor} p-3 rounded-2xl`}>
                <textarea
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent resize-none border-none outline-none min-h-[40px]"
                  rows={1}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Sauver
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
          <MessageBubble 
            message={message} 
                isMe={isMe}
            theme={theme} 
                onClick={() => setShowReactionMenu(!showReactionMenu)}
              />
            )}

            {/* Indicateur d'édition */}
            {message.isEdited && !isEditing && (
              <div className={`text-xs text-gray-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                <FiEdit2 className="inline mr-1" />
                modifié
              </div>
            )}

            {/* Indicateur IA */}
            {message.isAI && (
              <div className={`text-xs text-blue-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                <div className="inline-flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  IA
                  {message.isError && <BsExclamationTriangle className="text-red-500" />}
                </div>
              </div>
            )}

            {/* Actions rapides au survol */}
            <AnimatePresence>
              {showActions && !isEditing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute ${isMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1`}
                >
                  <button
                    onClick={() => setShowReactionMenu(!showReactionMenu)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                    title="Réagir"
                  >
                    😊
                  </button>
                  <button
                    onClick={() => onReply?.(message)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Répondre"
                  >
                    <BsReply />
                  </button>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Plus d'actions"
                  >
                    <FiMoreHorizontal />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu d'actions */}
            <ActionMenu />
          </div>

          {/* Médias */}
          {message.media && message.media.length > 0 && (
            <div className="mt-2">
              <MediaDisplay media={message.media} />
            </div>
          )}

          {/* Aperçu des liens */}
          {hasLinks && (
            <div className="mt-2">
              {message.text.match(linkRegex)?.map((url, index) => (
                <LinkPreview 
                  key={index} 
                  url={url} 
                  sender={message.sender}
                  compact={false}
                />
              ))}
            </div>
          )}

          {/* Réactions */}
          {hasReactions && (
            <div className="mt-1">
              <MessageReactions 
                reactions={message.reactions}
                onReactionClick={(reaction) => addReaction(message.id, reaction)}
          />
        </div>
          )}

          {/* Heure et statut */}
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">
              {message.time}
            </span>
            <StatusIcon />
          </div>
        </div>

        {/* Menu de réactions */}
        {showReactionMenu && (
          <ReactionMenu
            onClose={() => setShowReactionMenu(false)}
            onReactionSelect={(reaction) => {
              addReaction(message.id, reaction);
              setShowReactionMenu(false);
            }}
            position={isMe ? 'left' : 'right'}
          />
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(ChatMessage);