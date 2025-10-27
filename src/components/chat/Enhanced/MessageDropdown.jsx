import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaReply, FaForward, FaEdit, FaCopy, FaTrash, FaStar, 
  FaThumbtack, FaLock, FaEyeSlash, FaDownload, FaInfo 
} from 'react-icons/fa';

const MessageDropdown = ({ 
  message, 
  theme, 
  position = { x: 0, y: 0 }, 
  onClose, 
  onAction,
  isVisible = false 
}) => {
  const dropdownRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isVisible && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Ajuster horizontalement
      if (position.x + rect.width > viewportWidth - 10) {
        newX = viewportWidth - rect.width - 10;
      }
      
      // Ajuster verticalement
      if (position.y + rect.height > viewportHeight - 10) {
        newY = position.y - rect.height;
      }
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isVisible, position]);

  const menuItems = [
    // Actions principales
    {
      id: 'reply',
      icon: <FaReply />,
      label: 'Répondre',
      action: () => onAction('reply', message),
      color: 'text-blue-500'
    },
    {
      id: 'forward',
      icon: <FaForward />,
      label: 'Transférer',
      action: () => onAction('forward', message),
      color: 'text-green-500'
    },
    message.sender === 'me' && {
      id: 'edit',
      icon: <FaEdit />,
      label: 'Modifier',
      action: () => onAction('edit', message),
      color: 'text-orange-500'
    },
    {
      id: 'copy',
      icon: <FaCopy />,
      label: 'Copier',
      action: () => onAction('copy', message),
      color: theme.textColor
    },
    
    // Séparateur
    { type: 'separator' },
    
    // États du message
    {
      id: 'favorite',
      icon: <FaStar />,
      label: message.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
      action: () => onAction('favorite', message),
      color: message.isFavorite ? 'text-yellow-500' : theme.textColor
    },
    {
      id: 'pin',
      icon: <FaThumbtack />,
      label: message.isPinned ? 'Désépingler' : 'Épingler',
      action: () => onAction('pin', message),
      color: message.isPinned ? 'text-red-500' : theme.textColor
    },
    {
      id: 'lock',
      icon: <FaLock />,
      label: message.isLocked ? 'Déverrouiller' : 'Verrouiller',
      action: () => onAction('lock', message),
      color: message.isLocked ? 'text-gray-500' : theme.textColor
    },
    
    // Séparateur
    { type: 'separator' },
    
    // Actions avancées
    message.media?.length > 0 && {
      id: 'download',
      icon: <FaDownload />,
      label: 'Télécharger',
      action: () => onAction('download', message),
      color: theme.textColor
    },
    {
      id: 'hide',
      icon: <FaEyeSlash />,
      label: 'Masquer',
      action: () => onAction('hide', message),
      color: theme.textColor
    },
    {
      id: 'info',
      icon: <FaInfo />,
      label: 'Informations',
      action: () => onAction('info', message),
      color: theme.textColor
    },
    
    // Séparateur pour suppression
    { type: 'separator' },
    
    // Suppression (si c'est notre message)
    message.sender === 'me' && {
      id: 'delete',
      icon: <FaTrash />,
      label: 'Supprimer',
      action: () => onAction('delete', message),
      color: 'text-red-500',
      dangerous: true
    }
  ].filter(Boolean);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay pour fermer */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-50 min-w-[200px] ${theme.bgColor} rounded-lg shadow-2xl border ${theme.borderColor} py-2 backdrop-blur-sm`}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {menuItems.map((item, index) => (
          item.type === 'separator' ? (
            <div key={index} className={`mx-2 my-1 border-t ${theme.borderColor}`} />
          ) : (
            <motion.button
              key={item.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`
                w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm
                transition-colors duration-150
                ${item.dangerous ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : `hover:${theme.hoverBg}`}
                ${item.color}
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              
              {/* Indicateurs d'état */}
              {item.id === 'favorite' && message.isFavorite && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              )}
              {item.id === 'pin' && message.isPinned && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
              {item.id === 'lock' && message.isLocked && (
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              )}
            </motion.button>
          )
        ))}
      </motion.div>
    </>
  );
};

export default MessageDropdown;
