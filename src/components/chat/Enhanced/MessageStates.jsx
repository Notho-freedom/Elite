import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaPin, FaLock, FaReply, FaForward } from 'react-icons/fa';

const MessageStates = ({ message, theme, className = '' }) => {
  const states = [];

  // État verrouillé (priorité la plus haute)
  if (message.isLocked) {
    states.push({
      icon: <FaLock />,
      color: 'text-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-800',
      label: 'Message verrouillé'
    });
  }

  // État épinglé
  if (message.isPinned) {
    states.push({
      icon: <FaPin />,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      label: 'Message épinglé'
    });
  }

  // État favori
  if (message.isFavorite) {
    states.push({
      icon: <FaStar />,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      label: 'Message favori'
    });
  }

  // Message transféré
  if (message.isForwarded) {
    states.push({
      icon: <FaForward />,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      label: 'Message transféré'
    });
  }

  // Réponse à un message
  if (message.replyTo) {
    states.push({
      icon: <FaReply />,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      label: 'Réponse'
    });
  }

  if (states.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {states.map((state, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            w-5 h-5 rounded-full flex items-center justify-center
            ${state.bg} ${state.color}
          `}
          title={state.label}
        >
          <span className="text-xs">
            {state.icon}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour afficher les badges d'état sur la liste des discussions
export const DiscussionStates = ({ discussion, theme, className = '' }) => {
  const states = [];

  // Messages non lus
  if (discussion.unreadCount > 0) {
    states.push({
      text: discussion.unreadCount > 99 ? '99+' : discussion.unreadCount,
      bg: 'bg-red-500',
      color: 'text-white',
      label: `${discussion.unreadCount} message(s) non lu(s)`
    });
  }

  // Discussion épinglée
  if (discussion.isPinned) {
    states.push({
      icon: <FaPin />,
      bg: 'bg-red-50 dark:bg-red-900/20',
      color: 'text-red-500',
      label: 'Discussion épinglée'
    });
  }

  // Discussion archivée
  if (discussion.isArchived) {
    states.push({
      text: 'A',
      bg: 'bg-gray-500',
      color: 'text-white',
      label: 'Discussion archivée'
    });
  }

  // Messages favoris dans cette discussion
  if (discussion.favoriteCount > 0) {
    states.push({
      icon: <FaStar />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      color: 'text-yellow-500',
      label: `${discussion.favoriteCount} message(s) favori(s)`
    });
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {states.map((state, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1
            ${state.bg} ${state.color} text-xs font-bold
          `}
          title={state.label}
        >
          {state.icon || state.text}
        </motion.div>
      ))}
    </div>
  );
};

export default MessageStates;
