import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaThumbtack, FaArchive, FaStar, FaLock, FaBellSlash, 
  FaBan, FaTrash, FaCheck, FaForward, FaDownload,
  FaTimes, FaExclamationTriangle 
} from 'react-icons/fa';

// Composant de notification d'action
const ActionNotification = ({ 
  action, 
  discussionName, 
  isVisible, 
  onClose, 
  theme,
  type = 'success' // success, error, warning, info
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getActionIcon = (actionType) => {
    const iconMap = {
      pin: <FaThumbtack className="w-4 h-4" />,
      unpin: <FaThumbtack className="w-4 h-4" />,
      archive: <FaArchive className="w-4 h-4" />,
      unarchive: <FaArchive className="w-4 h-4" />,
      favorite: <FaStar className="w-4 h-4" />,
      unfavorite: <FaStar className="w-4 h-4" />,
      lock: <FaLock className="w-4 h-4" />,
      unlock: <FaLock className="w-4 h-4" />,
      mute: <FaBellSlash className="w-4 h-4" />,
      unmute: <FaBellSlash className="w-4 h-4" />,
      block: <FaBan className="w-4 h-4" />,
      unblock: <FaBan className="w-4 h-4" />,
      delete: <FaTrash className="w-4 h-4" />,
      'mark-read': <FaCheck className="w-4 h-4" />,
      forward: <FaForward className="w-4 h-4" />,
      export: <FaDownload className="w-4 h-4" />,
      report: <FaExclamationTriangle className="w-4 h-4" />,
    };
    
    return iconMap[actionType] || <FaCheck className="w-4 h-4" />;
  };

  const getActionMessage = (actionType, name) => {
    const messages = {
      pin: `Discussion "${name}" épinglée`,
      unpin: `Discussion "${name}" désépinglée`,
      archive: `Discussion "${name}" archivée`,
      unarchive: `Discussion "${name}" désarchivée`,
      favorite: `Discussion "${name}" ajoutée aux favoris`,
      unfavorite: `Discussion "${name}" retirée des favoris`,
      lock: `Discussion "${name}" verrouillée`,
      unlock: `Discussion "${name}" déverrouillée`,
      mute: `Notifications désactivées pour "${name}"`,
      unmute: `Notifications activées pour "${name}"`,
      block: `Utilisateur "${name}" bloqué`,
      unblock: `Utilisateur "${name}" débloqué`,
      delete: `Discussion "${name}" supprimée`,
      'mark-read': `Discussion "${name}" marquée comme lue`,
      forward: `Discussion "${name}" transférée`,
      export: `Conversation "${name}" exportée`,
      report: `Utilisateur "${name}" signalé`,
    };
    
    return messages[actionType] || `Action effectuée sur "${name}"`;
  };

  const getTypeStyles = (notificationType) => {
    const styles = {
      success: {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-600',
        icon: 'text-green-100'
      },
      error: {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-600',
        icon: 'text-red-100'
      },
      warning: {
        bg: 'bg-yellow-500',
        text: 'text-white',
        border: 'border-yellow-600',
        icon: 'text-yellow-100'
      },
      info: {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-600',
        icon: 'text-blue-100'
      }
    };
    
    return styles[notificationType] || styles.success;
  };

  const typeStyles = getTypeStyles(type);

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm min-w-[300px]
            ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}
            rounded-lg shadow-xl border backdrop-blur-sm
          `}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${typeStyles.icon}`}>
                {getActionIcon(action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {getActionMessage(action, discussionName)}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsShowing(false);
                  setTimeout(onClose, 300);
                }}
                className={`flex-shrink-0 ${typeStyles.icon} hover:text-white transition-colors`}
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: "linear" }}
            className="h-1 bg-white/30 rounded-b-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Version simple du hook pour gérer les notifications d'actions
export const useActionNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (action, discussionName, type = 'success') => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      action,
      discussionName,
      type,
      isVisible: true
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-supprimer après 4 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NotificationContainer = ({ theme }) => (
    <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className="pointer-events-auto"
          >
            <ActionNotification
              action={notification.action}
              discussionName={notification.discussionName}
              isVisible={notification.isVisible}
              onClose={() => hideNotification(notification.id)}
              theme={theme}
              type={notification.type}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    showNotification,
    NotificationContainer
  };
};

export default ActionNotification;
