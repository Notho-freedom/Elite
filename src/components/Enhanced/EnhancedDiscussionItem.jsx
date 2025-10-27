import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCircle, FaThumbtack, FaArchive } from 'react-icons/fa';
import { DiscussionStates } from '../chat/Enhanced/MessageStates';

const EnhancedDiscussionItem = ({ 
  discussion, 
  onClick, 
  theme, 
  isActive = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'Aucun message';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  // Enrichir la discussion avec des états simulés
  const enrichedDiscussion = {
    ...discussion,
    unreadCount: discussion.unread ? Math.floor(Math.random() * 5) + 1 : 0,
    isPinned: discussion.isPinned || Math.random() > 0.8,
    isArchived: discussion.isArchived || false,
    favoriteCount: Math.floor(Math.random() * 3)
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
      className={`
        relative group cursor-pointer p-3 rounded-lg transition-all duration-200
        ${isActive 
          ? `${theme.accentBg} text-white shadow-md` 
          : `${theme.bgColor} hover:${theme.hoverBg}`
        }
        ${enrichedDiscussion.isPinned ? 'border-l-4 border-blue-500' : ''}
        ${enrichedDiscussion.isArchived ? 'opacity-60' : ''}
      `}
    >
      {/* Indicateur épinglé */}
      {enrichedDiscussion.isPinned && (
        <div className="absolute top-1 left-1">
          <FaThumbtack className="w-3 h-3 text-blue-500" />
        </div>
      )}

      {/* Indicateur archivé */}
      {enrichedDiscussion.isArchived && (
        <div className="absolute top-1 right-1">
          <FaArchive className="w-3 h-3 text-gray-500" />
        </div>
      )}

      <div className="flex items-center space-x-3">
        {/* Avatar avec statut en ligne */}
        <div className="relative flex-shrink-0">
          <img
            src={discussion.avatar}
            alt={discussion.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-transparent"
          />
          {discussion.isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
          
          {/* Indicateur de message non lu */}
          {enrichedDiscussion.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {enrichedDiscussion.unreadCount > 9 ? '9+' : enrichedDiscussion.unreadCount}
            </motion.div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`
              font-medium truncate
              ${isActive ? 'text-white' : theme.textColor}
              ${enrichedDiscussion.unreadCount > 0 ? 'font-bold' : ''}
            `}>
              {discussion.name}
            </h4>
            
            <div className="flex items-center gap-2 ml-2">
              {/* États de la discussion */}
              <DiscussionStates 
                discussion={enrichedDiscussion} 
                theme={theme} 
              />
              
              {/* Heure */}
              <span className={`
                text-xs whitespace-nowrap
                ${isActive ? 'text-white/80' : theme.secondaryText}
                ${enrichedDiscussion.unreadCount > 0 ? 'font-semibold' : ''}
              `}>
                {formatTime(discussion.lastMessageTime)}
              </span>
            </div>
          </div>

          {/* Dernier message */}
          <div className="flex justify-between items-center">
            <p className={`
              text-sm truncate
              ${isActive ? 'text-white/90' : theme.secondaryText}
              ${enrichedDiscussion.unreadCount > 0 ? 'font-medium' : ''}
            `}>
              {truncateMessage(discussion.lastMessage)}
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'action rapide (visible au hover) */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: showMenu ? 1 : 0, x: showMenu ? 0 : 10 }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/80 rounded-full p-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Pin discussion:', discussion.id);
          }}
          className="p-1 text-white hover:text-blue-400 transition-colors"
          title="Épingler"
        >
          <FaThumbtack className="w-3 h-3" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Archive discussion:', discussion.id);
          }}
          className="p-1 text-white hover:text-gray-400 transition-colors"
          title="Archiver"
        >
          <FaArchive className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedDiscussionItem;
