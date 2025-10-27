import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCornerUpLeft, FiImage, FiVideo, FiFile, FiFileText, FiMic } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { BsReply } from 'react-icons/bs';

/**
 * ✨ Composant de preview de réponse - Style ELITE
 * Design moderne avec glassmorphism et animations fluides
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

  // Design ELITE avec glassmorphism et gradients
  const getEliteStyles = () => {
    if (isCurrentUser) {
      return {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderLeft: '3px solid rgba(255,255,255,0.6)',
        textColor: 'text-white/95',
        iconColor: 'text-white/80',
        nameColor: 'text-white/70',
        backdropBlur: 'backdrop-blur-xl',
        shadow: 'shadow-lg shadow-black/20'
      };
    } else {
      return theme.mode === 'dark' 
        ? {
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderLeft: '3px solid rgb(59,130,246)',
            textColor: 'text-gray-100',
            iconColor: 'text-blue-400',
            nameColor: 'text-blue-300',
            backdropBlur: 'backdrop-blur-xl',
            shadow: 'shadow-lg shadow-blue-500/10'
          }
        : {
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.03) 100%)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderLeft: '3px solid rgb(59,130,246)',
            textColor: 'text-gray-800',
            iconColor: 'text-blue-600',
            nameColor: 'text-blue-500',
            backdropBlur: 'backdrop-blur-sm',
            shadow: 'shadow-md shadow-blue-500/10'
          };
    }
  };

  const styles = getEliteStyles();

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
          icon: <FiImage className="w-4 h-4" />,
          text: 'Photo',
          emoji: '📷',
          hasMediaPreview: true,
          mediaUrl: media.url,
          gradient: 'from-emerald-500 to-teal-500'
        };
      } else if (mediaType.startsWith('video/') || media.type === 'video') {
        return {
          icon: <FiVideo className="w-4 h-4" />,
          text: 'Vidéo',
          emoji: '🎥',
          hasMediaPreview: true,
          mediaUrl: media.url,
          gradient: 'from-purple-500 to-pink-500'
        };
      } else if (mediaType.startsWith('audio/') || media.type === 'audio') {
        return {
          icon: <FiMic className="w-4 h-4" />,
          text: 'Audio',
          emoji: '🎵',
          hasMediaPreview: false,
          gradient: 'from-orange-500 to-red-500'
        };
      } else {
        return {
          icon: <FiFile className="w-4 h-4" />,
          text: media.name || 'Fichier',
          emoji: '📎',
          hasMediaPreview: false,
          gradient: 'from-gray-500 to-slate-500'
        };
      }
    } else if (hasMedia && originalText.trim()) {
      // Message avec média ET texte
      return {
        icon: <FiImage className="w-4 h-4" />,
        text: originalText.length > 25 ? `${originalText.substring(0, 25)}...` : originalText,
        emoji: '📷',
        hasMediaPreview: true,
        mediaUrl: replyToMessage.media[0].url,
        gradient: 'from-emerald-500 to-teal-500'
      };
    } else {
      // Message texte uniquement
      return {
        icon: <FiFileText className="w-4 h-4" />,
        text: originalText.length > 40 ? `${originalText.substring(0, 40)}...` : originalText,
        emoji: '💬',
        hasMediaPreview: false,
        gradient: 'from-blue-500 to-indigo-500'
      };
    }
  };

  const previewContent = getPreviewContent();
  const senderName = replyToMessage.senderName || replyToMessage.sender || 'Utilisateur';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative mb-3 p-3 rounded-xl cursor-pointer
        ${styles.backdropBlur} ${styles.shadow}
        transition-all duration-300 ease-out
        group overflow-hidden
        border-0
      `}
      style={{
        background: styles.background,
        border: styles.border,
        borderLeft: styles.borderLeft
      }}
    >
      {/* Effet de brillance ELITE */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* En-tête avec indicateur de réponse stylé */}
      <div className="flex items-center gap-2 mb-2">
        <motion.div 
          className={`p-1 rounded-full bg-gradient-to-r ${previewContent.gradient || 'from-blue-500 to-indigo-500'}`}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <BsReply className="w-3 h-3 text-white" />
        </motion.div>
        
        <div className="flex items-center gap-2 flex-1">
          <span className={`text-xs font-semibold ${styles.nameColor} tracking-wide uppercase`}>
            {senderName}
          </span>
          <HiSparkles className={`w-3 h-3 ${styles.iconColor} opacity-60`} />
        </div>
      </div>

      {/* Contenu principal avec design amélioré */}
      <div className="flex items-center gap-3">
        {/* Preview du média avec style ELITE */}
        <AnimatePresence>
          {previewContent.hasMediaPreview && previewContent.mediaUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex-shrink-0 relative"
            >
              <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br ${previewContent.gradient} p-0.5`}>
                <img 
                  src={previewContent.mediaUrl}
                  alt="Preview"
                  className="w-full h-full rounded-md object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs">{previewContent.emoji}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu texte stylé */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!previewContent.hasMediaPreview && (
            <motion.div 
              className={`p-1.5 rounded-lg bg-gradient-to-r ${previewContent.gradient} flex-shrink-0`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {previewContent.icon ? (
                <span className="text-white">
                  {previewContent.icon}
                </span>
              ) : (
                <span className="text-sm">{previewContent.emoji}</span>
              )}
            </motion.div>
          )}
          
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${styles.textColor} font-medium truncate block leading-relaxed`}>
              {previewContent.text || 'Message'}
            </span>
          </div>
        </div>
      </div>

      {/* Effet de survol ELITE avec gradient animé */}
      <motion.div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${isCurrentUser ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.1)'} 0%, transparent 100%)`
        }}
      />
      
      {/* Particules flottantes pour l'effet ELITE */}
      <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <HiSparkles className={`w-3 h-3 ${styles.iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReplyPreviewBubble;
