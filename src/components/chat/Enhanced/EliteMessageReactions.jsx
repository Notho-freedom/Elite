import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiOutlinePlus } from 'react-icons/hi2';
import { FaHeart, FaLaugh, FaAngry, FaSadCry, FaThumbsUp, FaSurprise } from 'react-icons/fa';
import clsx from 'clsx';

/**
 * ✨ Composant de réactions ELITE
 * Design moderne avec glassmorphism et animations fluides
 * Affichage au survol avec synchronisation Supabase
 */
const EliteMessageReactions = ({
  message,
  currentUserId,
  theme,
  onAddReaction,
  onRemoveReaction,
  isCurrentUser,
  isMessageHovered
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Afficher automatiquement le picker au survol du message
  useEffect(() => {
    if (isMessageHovered && !showReactionPicker) {
      const timer = setTimeout(() => {
        setShowReactionPicker(true);
      }, 200); // Délai de 200ms pour un affichage rapide
      
      return () => clearTimeout(timer);
    } else if (!isMessageHovered && !isHovered && showReactionPicker) {
      // Ne fermer que si ni le message ni les réactions ne sont survolés
      const timer = setTimeout(() => {
        setShowReactionPicker(false);
      }, 1500); // Délai de 1.5s pour garder le picker ouvert plus longtemps
      
      return () => clearTimeout(timer);
    }
  }, [isMessageHovered, isHovered, showReactionPicker]);

  // Réactions populaires avec icônes et gradients
  const popularReactions = [
    { emoji: '👍', icon: FaThumbsUp, name: 'J\'aime', gradient: 'from-blue-500 to-blue-600' },
    { emoji: '❤️', icon: FaHeart, name: 'Amour', gradient: 'from-red-500 to-pink-500' },
    { emoji: '😂', icon: FaLaugh, name: 'Rire', gradient: 'from-yellow-500 to-orange-500' },
    { emoji: '😮', icon: FaSurprise, name: 'Surprise', gradient: 'from-purple-500 to-indigo-500' },
    { emoji: '😢', icon: FaSadCry, name: 'Triste', gradient: 'from-gray-500 to-blue-500' },
    { emoji: '😡', icon: FaAngry, name: 'Colère', gradient: 'from-red-600 to-red-700' }
  ];

  // Analyser les réactions du message
  const reactionStats = useMemo(() => {
    if (!message.reactions || message.reactions.length === 0) {
      return [];
    }
    
    const stats = {};
    message.reactions.forEach((reaction) => {
      const emoji = reaction.emoji || reaction;
      if (stats[emoji]) {
        stats[emoji].count++;
        stats[emoji].users.push(reaction.userId || reaction.user_id);
      } else {
        stats[emoji] = {
          emoji,
          count: 1,
          users: [reaction.userId || reaction.user_id],
          hasCurrentUser: (reaction.userId || reaction.user_id) === currentUserId
        };
      }
    });
    
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [message.reactions, currentUserId]);

  const hasUserReacted = reactionStats.some(stat => stat.hasCurrentUser);

  // Styles adaptatifs selon le thème et l'utilisateur
  const getReactionStyles = (hasCurrentUser) => {
    if (hasCurrentUser) {
      return isCurrentUser 
        ? {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            border: '1px solid rgba(255,255,255,0.5)',
            textColor: 'text-white',
            shadow: 'shadow-lg shadow-white/20'
          }
        : {
            background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.2) 100%)',
            border: '1px solid rgba(59,130,246,0.6)',
            textColor: 'text-blue-100',
            shadow: 'shadow-lg shadow-blue-500/30'
          };
    } else {
      return isCurrentUser
        ? {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            textColor: 'text-white/80',
            shadow: 'shadow-md shadow-black/10'
          }
        : theme.mode === 'dark'
          ? {
              background: 'linear-gradient(135deg, rgba(75,85,99,0.3) 0%, rgba(55,65,81,0.2) 100%)',
              border: '1px solid rgba(75,85,99,0.4)',
              textColor: 'text-gray-300',
              shadow: 'shadow-md shadow-gray-500/20'
            }
          : {
              background: 'linear-gradient(135deg, rgba(243,244,246,0.8) 0%, rgba(229,231,235,0.6) 100%)',
              border: '1px solid rgba(209,213,219,0.4)',
              textColor: 'text-gray-700',
              shadow: 'shadow-md shadow-gray-300/30'
            };
    }
  };

  const pickerStyles = isCurrentUser
    ? {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropBlur: 'backdrop-blur-xl'
      }
    : theme.mode === 'dark'
      ? {
          background: 'linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(17,24,39,0.6) 100%)',
          border: '1px solid rgba(75,85,99,0.3)',
          backdropBlur: 'backdrop-blur-xl'
        }
      : {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.8) 100%)',
          border: '1px solid rgba(209,213,219,0.3)',
          backdropBlur: 'backdrop-blur-sm'
        };

  const handleReactionClick = (emoji) => {
    const currentReaction = reactionStats.find(stat => stat.emoji === emoji);
    
    if (currentReaction?.hasCurrentUser) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onAddReaction?.(message.id, emoji);
    }
  };

  const handleQuickReaction = (emoji) => {
    handleReactionClick(emoji);
    setShowReactionPicker(false);
  };

  // Debug: Log des données reçues
  console.log('🔍 EliteMessageReactions Debug:', {
    messageId: message.id,
    reactions: message.reactions,
    reactionStats: reactionStats,
    showReactionPicker,
    isHovered,
    currentUserId,
    isCurrentUser
  });

  // Ne rien afficher si pas de réactions et pas de picker ouvert et pas de survol du message
  if (reactionStats.length === 0 && !showReactionPicker && !isHovered && !isMessageHovered) {
    return null;
  }

  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-2 relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Réactions existantes */}
        <AnimatePresence>
          {reactionStats.map((stat, index) => {
            const styles = getReactionStyles(stat.hasCurrentUser);
            
            return (
              <motion.button
                key={stat.emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReactionClick(stat.emoji)}
                onMouseEnter={() => setHoveredReaction(stat)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={`
                  relative flex items-center gap-1 px-1.5 py-0.5 rounded-full
                  transition-all duration-300 ease-out
                  ${styles.shadow} ${styles.textColor}
                  backdrop-blur-sm group overflow-hidden
                `}
                style={{
                  background: styles.background,
                  border: styles.border
                }}
              >
                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                {/* Emoji et compteur */}
                <span className="text-xs relative z-10">{stat.emoji}</span>
                {stat.count > 1 && (
                  <span className="text-[10px] font-medium relative z-10">
                    {stat.count}
                  </span>
                )}

                {/* Particule flottante si c'est la réaction de l'utilisateur */}
                {stat.hasCurrentUser && (
                  <motion.div
                    className="absolute top-0 right-0 -mt-1 -mr-1"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <HiSparkles className="w-2 h-2 text-yellow-400" />
                  </motion.div>
                )}

                {/* Effet de survol */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-transparent" />
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Bouton d'ajout de réaction - visible au survol du composant, du message, ou si des réactions existent */}
        {(isHovered || isMessageHovered || reactionStats.length > 0) && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className={`
              relative p-1 rounded-full
              transition-all duration-300 ease-out
              ${isCurrentUser ? 'text-white/70 hover:text-white' : theme.mode === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
              backdrop-blur-sm group
            `}
                          style={{
                background: isCurrentUser 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  : theme.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(75,85,99,0.2) 0%, rgba(55,65,81,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(243,244,246,0.6) 0%, rgba(229,231,235,0.4) 100%)',
                border: isCurrentUser 
                  ? '1px solid rgba(255,255,255,0.2)'
                  : theme.mode === 'dark'
                    ? '1px solid rgba(75,85,99,0.3)'
                    : '1px solid rgba(209,213,219,0.3)'
              }}
          >
            <HiOutlinePlus className="w-2.5 h-2.5" />
          </motion.button>
        )}
      </div>

      {/* Picker de réactions ELITE */}
      <AnimatePresence>
        {showReactionPicker && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 10 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className={`
              absolute ${isCurrentUser ? 'right-0' : 'left-0'} top-full mt-2
              p-2 rounded-lg backdrop-blur-xl
              z-50 shadow-2xl border border-white/20
            `}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Effet de brillance */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex gap-1.5">
              {popularReactions.map((reaction, index) => (
                <motion.button
                  key={reaction.emoji}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { delay: index * 0.05 }
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    y: -3,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuickReaction(reaction.emoji)}
                  className={`
                    relative p-1.5 rounded-md
                    bg-gradient-to-r ${reaction.gradient}
                    text-white shadow-md
                    transition-all duration-300
                    group overflow-hidden
                  `}
                  title={reaction.name}
                >
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  
                  <span className="text-sm relative z-10">{reaction.emoji}</span>
                  
                  {/* Label au survol */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 bg-black/80 text-white rounded whitespace-nowrap"
                  >
                    {reaction.name}
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip pour les réactions au survol */}
      <AnimatePresence>
        {hoveredReaction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              {hoveredReaction.count === 1 
                ? `${hoveredReaction.hasCurrentUser ? 'Vous' : '1 personne'} a réagi avec ${hoveredReaction.emoji}`
                : `${hoveredReaction.count} personnes ont réagi avec ${hoveredReaction.emoji}`
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EliteMessageReactions;
