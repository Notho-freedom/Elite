import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaThumbtack, FaLock, FaReply, FaForward } from 'react-icons/fa';

const FeatureNotification = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu la notification
    const hasSeenNotification = localStorage.getItem('elite-enhanced-chat-seen');
    if (!hasSeenNotification) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('elite-enhanced-chat-seen', 'true');
  };

  const features = [
    {
      icon: <FaReply />,
      title: 'Réponses aux messages',
      description: 'Répondez directement à des messages spécifiques'
    },
    {
      icon: <FaThumbtack />,
      title: 'Messages épinglés',
      description: 'Épinglez les messages importants en haut du chat'
    },
    {
      icon: <FaStar />,
      title: 'Messages favoris',
      description: 'Marquez vos messages préférés comme favoris'
    },
    {
      icon: <FaLock />,
      title: 'Messages verrouillés',
      description: 'Protégez vos messages sensibles'
    },
    {
      icon: <FaForward />,
      title: 'Transfert de messages',
      description: 'Partagez des messages vers d\'autres discussions'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              ${theme.bgColor} rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl 
              border ${theme.borderColor} relative
            `}
          >
            {/* Bouton fermer */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className={`
                absolute top-4 right-4 p-1 rounded-full 
                ${theme.hoverBg} ${theme.secondaryText}
              `}
            >
              <FaTimes className="w-4 h-4" />
            </motion.button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className={`
                w-16 h-16 rounded-full ${theme.accentBg} 
                mx-auto flex items-center justify-center mb-4
              `}>
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className={`text-xl font-bold ${theme.textColor} mb-2`}>
                Chat Elite Amélioré !
              </h2>
              <p className={`${theme.secondaryText} text-sm`}>
                Découvrez les nouvelles fonctionnalités de messagerie
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg 
                    ${theme.headerBg} border ${theme.borderColor}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full ${theme.accentBg} 
                    flex items-center justify-center text-white text-sm
                  `}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${theme.textColor} text-sm`}>
                      {feature.title}
                    </h3>
                    <p className={`${theme.secondaryText} text-xs`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium
                  ${theme.accentBg} text-white text-sm
                `}
              >
                Découvrir maintenant
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className={`
                  px-4 py-3 rounded-lg font-medium border 
                  ${theme.borderColor} ${theme.textColor} text-sm
                  hover:${theme.hoverBg}
                `}
              >
                Plus tard
              </motion.button>
            </div>

            {/* Tip */}
            <div className={`mt-4 p-3 ${theme.headerBg} rounded-lg`}>
              <p className={`text-xs ${theme.secondaryText} text-center`}>
                💡 <strong>Astuce :</strong> Clic droit sur un message pour voir toutes les options
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureNotification;
