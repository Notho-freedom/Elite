import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = ({ users = [], theme }) => {
  if (!users || users.length === 0) return null;

  // Formatage du texte selon le nombre d'utilisateurs
  const getTypingText = () => {
    if (users.length === 1) {
      const user = users[0];
      const userName = user.user?.name || user.name || 'Quelqu\'un';
      return `${userName} tape...`;
    } else if (users.length === 2) {
      const names = users.map(u => u.user?.name || u.name || 'Utilisateur');
      return `${names.join(' et ')} tapent...`;
    } else {
      return `${users.length} personnes tapent...`;
    }
  };

  // Composant de points animés
  const TypingDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Avatars des utilisateurs (max 3 affichés)
  const TypingAvatars = () => {
    const displayUsers = users.slice(0, 3);
    const remainingCount = users.length - 3;

    return (
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <motion.div
            key={user.user_id || user.id || index}
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: -20 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <img
              src={user.user?.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user?.name || user.name || 'U')}&background=6366f1&color=fff&size=24`}
              alt={user.user?.name || user.name || 'Utilisateur'}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"
            />
            {/* Indicateur de frappe sur l'avatar */}
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border border-white dark:border-gray-800"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
        
        {/* Indicateur pour utilisateurs supplémentaires */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center"
          >
            <span className="text-xs text-white font-medium">
              +{remainingCount}
            </span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 px-4 py-2 mb-2"
    >
      {/* Avatars des utilisateurs qui tapent */}
      <TypingAvatars />

      {/* Bulle d'indicateur de frappe */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${theme?.bgSecondary || 'bg-gray-100 dark:bg-gray-700'} border ${theme?.borderColor || 'border-gray-200 dark:border-gray-600'} max-w-xs`}
      >
        {/* Points animés */}
        <TypingDots />
        
        {/* Texte d'indication */}
        <div className={`text-sm ${theme?.textColor || 'text-gray-600 dark:text-gray-400'}`}>
          {getTypingText()}
        </div>
      </motion.div>

      {/* Effet de pulsation sur toute la zone */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default TypingIndicator;