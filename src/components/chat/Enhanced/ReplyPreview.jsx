import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaReply } from 'react-icons/fa';

const ReplyPreview = ({ 
  replyingTo, 
  theme, 
  onClose, 
  className = '' 
}) => {
  if (!replyingTo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`
        ${theme.headerBg} border-t ${theme.borderColor} 
        px-4 py-3 flex items-center gap-3 ${className}
      `}
    >
      {/* Icône de réponse */}
      <div className={`text-blue-500`}>
        <FaReply className="w-4 h-4" />
      </div>

      {/* Ligne de couleur */}
      <div className="w-1 h-8 bg-blue-500 rounded-full" />

      {/* Contenu du message original */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${theme.textColor} mb-1`}>
          Réponse à {replyingTo.sender === 'me' ? 'vous' : replyingTo.senderName || 'Contact'}
        </div>
        
        <div className={`text-sm ${theme.secondaryText} truncate`}>
          {replyingTo.media?.length > 0 ? (
            <span className="flex items-center gap-1">
              {replyingTo.media[0].type === 'image' ? '📷' : '🎥'} 
              {replyingTo.media.length > 1 && `(+${replyingTo.media.length - 1})`}
              {replyingTo.text && ` ${replyingTo.text}`}
            </span>
          ) : (
            replyingTo.text || 'Message'
          )}
        </div>
      </div>

      {/* Aperçu média si disponible */}
      {replyingTo.media?.[0] && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          {replyingTo.media[0].type === 'image' ? (
            <img 
              src={replyingTo.media[0].url} 
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              🎥
            </div>
          )}
        </div>
      )}

      {/* Bouton fermer */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className={`
          p-1 rounded-full ${theme.hoverBg} ${theme.secondaryText}
          hover:${theme.textColor} transition-colors
        `}
        aria-label="Annuler la réponse"
      >
        <FaTimes className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
};

export default ReplyPreview;
