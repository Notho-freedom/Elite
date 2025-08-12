import React from 'react';
import { motion } from 'framer-motion';
import { FiCornerUpLeft, FiImage, FiVideo, FiFile } from 'react-icons/fi';

/**
 * 💬 Composant de preview de réponse - Style WhatsApp
 * Affiche un aperçu du message original dans les réponses
 */
const ReplyPreviewBubble = ({ 
  replyToMessage, 
  theme, 
  onClick,
  isCurrentUser = false 
}) => {
  if (!replyToMessage) return null;
  
  // Debug: vérifier les données reçues
  console.log('🔍 ReplyPreviewBubble - données reçues:', replyToMessage);

  // Couleurs adaptées au thème
  const borderColor = isCurrentUser 
    ? 'border-l-white/30' 
    : theme.mode === 'dark' 
      ? 'border-l-blue-400' 
      : 'border-l-blue-500';
      
  const bgColor = isCurrentUser
    ? 'bg-black/10'
    : theme.mode === 'dark'
      ? 'bg-gray-800/50'
      : 'bg-gray-100/80';

  const textColor = isCurrentUser
    ? 'text-white/90'
    : theme.mode === 'dark'
      ? 'text-gray-300'
      : 'text-gray-700';

  // Formatage du contenu à afficher
  const getPreviewContent = () => {
    const originalText = replyToMessage.text || replyToMessage.content || '';
    const hasMedia = replyToMessage.media && replyToMessage.media.length > 0;
    
    if (hasMedia && !originalText.trim()) {
      // Message avec média seulement
      const media = replyToMessage.media[0];
      const mediaType = media.type || media.mediaType || 'file';
      
      if (mediaType.startsWith('image/') || media.type === 'image') {
        return {
          icon: <FiImage className="w-3 h-3" />,
          text: '📷 Photo',
          hasMediaPreview: true,
          mediaUrl: media.url
        };
      } else if (mediaType.startsWith('video/') || media.type === 'video') {
        return {
          icon: <FiVideo className="w-3 h-3" />,
          text: '🎥 Vidéo',
          hasMediaPreview: true,
          mediaUrl: media.url
        };
      } else {
        return {
          icon: <FiFile className="w-3 h-3" />,
          text: `📎 ${media.name || 'Fichier'}`,
          hasMediaPreview: false
        };
      }
    } else if (hasMedia && originalText.trim()) {
      // Message avec média ET texte
      return {
        icon: <FiImage className="w-3 h-3" />,
        text: originalText.length > 30 ? `${originalText.substring(0, 30)}...` : originalText,
        hasMediaPreview: true,
        mediaUrl: replyToMessage.media[0].url
      };
    } else {
      // Message texte uniquement
      return {
        icon: null,
        text: originalText.length > 50 ? `${originalText.substring(0, 50)}...` : originalText,
        hasMediaPreview: false
      };
    }
  };

  const previewContent = getPreviewContent();
  const senderName = replyToMessage.senderName || replyToMessage.sender || 'Utilisateur';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        relative mb-2 p-2 rounded-lg cursor-pointer
        border-l-3 ${borderColor} ${bgColor}
        hover:bg-opacity-80 transition-all duration-200
        backdrop-blur-sm
      `}
    >
      {/* Indicateur de réponse */}
      <div className="flex items-center gap-1 mb-1">
        <FiCornerUpLeft className={`w-3 h-3 ${textColor}`} />
        <span className={`text-xs font-medium ${textColor}`}>
          {senderName}
        </span>
      </div>

      {/* Contenu de la préview */}
      <div className="flex items-center gap-2">
        {/* Preview du média si présent */}
        {previewContent.hasMediaPreview && previewContent.mediaUrl && (
          <div className="flex-shrink-0">
            <img 
              src={previewContent.mediaUrl}
              alt="Preview"
              className="w-8 h-8 rounded object-cover bg-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Icône et texte */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {previewContent.icon && (
            <span className={`flex-shrink-0 ${textColor}`}>
              {previewContent.icon}
            </span>
          )}
          <span className={`text-xs ${textColor} truncate`}>
            {previewContent.text || 'Message'}
          </span>
        </div>
      </div>

      {/* Effet de survol */}
      <div className={`
        absolute inset-0 rounded-lg 
        bg-gradient-to-r from-transparent to-white/5
        opacity-0 hover:opacity-100 transition-opacity duration-200
        pointer-events-none
      `} />
    </motion.div>
  );
};

export default ReplyPreviewBubble;
