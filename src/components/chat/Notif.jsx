import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheck, FiX, FiInfo, FiAlertTriangle, FiAlertCircle,
  FiCopy, FiDownload, FiHeart, FiShare2, FiEdit3,
  FiTrash2, FiLock, FiEye, FiEyeOff
} from 'react-icons/fi';
import { FaThumbtack } from 'react-icons/fa';

// Types de notifications
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  ACTION: 'action'
};

// Configuration des types
const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    icon: FiCheck,
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600'
  },
  [NOTIFICATION_TYPES.ERROR]: {
    icon: FiAlertCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600'
  },
  [NOTIFICATION_TYPES.WARNING]: {
    icon: FiAlertTriangle,
    bgColor: 'bg-yellow-500',
    textColor: 'text-black',
    borderColor: 'border-yellow-600'
  },
  [NOTIFICATION_TYPES.INFO]: {
    icon: FiInfo,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600'
  },
  [NOTIFICATION_TYPES.ACTION]: {
    icon: FiInfo,
    bgColor: 'bg-gray-700',
    textColor: 'text-white',
    borderColor: 'border-gray-600'
  }
};

// Actions avec leurs icônes et messages
const ACTION_CONFIG = {
  copy: {
    icon: FiCopy,
    message: 'Message copié dans le presse-papiers',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  download: {
    icon: FiDownload,
    message: 'Téléchargement démarré',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  share: {
    icon: FiShare2,
    message: 'Contenu partagé avec succès',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  favorite: {
    icon: FiHeart,
    message: 'Ajouté aux favoris',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  unfavorite: {
    icon: FiHeart,
    message: 'Retiré des favoris',
    type: NOTIFICATION_TYPES.INFO
  },
  pin: {
    icon: FaThumbtack,
    message: 'Message épinglé',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  unpin: {
    icon: FaThumbtack,
    message: 'Message désépinglé',
    type: NOTIFICATION_TYPES.INFO
  },
  edit: {
    icon: FiEdit3,
    message: 'Message modifié',
    type: NOTIFICATION_TYPES.SUCCESS
  },
  delete: {
    icon: FiTrash2,
    message: 'Message supprimé',
    type: NOTIFICATION_TYPES.WARNING
  },
  lock: {
    icon: FiLock,
    message: 'Message verrouillé',
    type: NOTIFICATION_TYPES.INFO
  },
  unlock: {
    icon: FiLock,
    message: 'Message déverrouillé',
    type: NOTIFICATION_TYPES.INFO
  },
  hide: {
    icon: FiEyeOff,
    message: 'Message masqué',
    type: NOTIFICATION_TYPES.WARNING
  },
  show: {
    icon: FiEye,
    message: 'Message affiché',
    type: NOTIFICATION_TYPES.INFO
  }
};

// Contexte pour les notifications
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider des notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove après 4 secondes
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 4000);

    return id;
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Notifications rapides pour les actions
  const notifyAction = useCallback((action, customMessage = null) => {
    const config = ACTION_CONFIG[action];
    if (!config) {
      console.warn(`Action notification config not found: ${action}`);
      return;
    }

    addNotification({
      type: config.type,
      message: customMessage || config.message,
      action,
      icon: config.icon
    });
  }, [addNotification]);

  // Notifications personnalisées
  const notifySuccess = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyError = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyWarning = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyInfo = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    notifyAction,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Composant notification individuelle
const NotificationItem = ({ notification, onRemove }) => {
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG[NOTIFICATION_TYPES.INFO];
  const IconComponent = notification.icon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm
        border-l-4 max-w-sm w-full
        ${config.bgColor} ${config.textColor} ${config.borderColor}
      `}
    >
      {/* Icône */}
      <div className="flex-shrink-0">
        <IconComponent size={20} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">
          {notification.message}
        </p>
        {notification.subtitle && (
          <p className="text-xs opacity-80 mt-1">
            {notification.subtitle}
          </p>
        )}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
};

// Conteneur des notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour les notifications de messages
export const useMessageNotifications = () => {
  const { notifyAction, notifySuccess, notifyError } = useNotifications();

  const notifyMessageAction = useCallback((action, messageData = {}) => {
    switch (action) {
      case 'copy':
        notifyAction('copy');
        break;
      case 'download':
        notifyAction('download');
        break;
      case 'share':
        notifyAction('share');
        break;
      case 'favorite':
        notifyAction(messageData.isFavorite ? 'unfavorite' : 'favorite');
        break;
      case 'pin':
        notifyAction(messageData.isPinned ? 'unpin' : 'pin');
        break;
      case 'edit':
        notifyAction('edit');
        break;
      case 'delete':
        notifyAction('delete');
        break;
      case 'lock':
        notifyAction(messageData.isLocked ? 'unlock' : 'lock');
        break;
      case 'hide':
        notifyAction(messageData.isHidden ? 'show' : 'hide');
        break;
      case 'forward':
        notifySuccess('Message transféré');
        break;
      default:
        notifySuccess('Action effectuée');
    }
  }, [notifyAction, notifySuccess]);

  return { notifyMessageAction };
};

// Export du composant pour compatibilité
export default NotificationContainer;
