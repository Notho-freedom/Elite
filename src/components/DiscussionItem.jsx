import { motion } from 'framer-motion';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

const CHECK_ICONS = {
  read: <FaCheckDouble className="text-xs text-blue-400 ml-2 shrink-0" />,
  online: <FaCheckDouble className="text-xs text-gray-400 ml-2 shrink-0" />,
  received: <FaCheck className="text-xs text-gray-400 ml-2 shrink-0" />,
};

const DiscussionItem = ({ discussion, onClick }) => {
  const {theme} = useTheme();
  const renderCheckIcon = () => {
    if (!discussion.unread) {
      if (discussion.isRead) return CHECK_ICONS.read;
      if (discussion.isOnline) return CHECK_ICONS.online;
      return CHECK_ICONS.received;
    }
    return null;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center px-6 py-3 transition-colors relative cursor-pointer ${theme.hoverBg}`}
      onClick={onClick}
      aria-label={`Ouvrir la discussion avec ${discussion.name}`}
                variants={itemVariants}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                layout
                whileHover={{ scale: 1.03 }}
    >
      <div className="relative">
        <motion.img
          alt={`${discussion.name}'s avatar`}
          src={discussion.avatar}
          className="w-12 h-12 rounded-full border-2 border-transparent"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={discussion.actu ? { borderColor: '#0a84ff' } : {}}
        />
        {discussion.isOnline && (
          <motion.span
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full"
            layoutId={`status-${discussion.id}`}
          />
        )}
      </div>

      <div className="ml-4 flex-1 text-left overflow-hidden">
        <div className="flex justify-between items-center">
          <p className={`font-semibold text-sm truncate max-w-[65%] ${theme.textColor}`}>
            {discussion.name}
          </p>
          <p className="text-xs text-gray-400 whitespace-nowrap">{discussion.timeDisplay}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate ${discussion.unread ? 'text-gray-300' : 'text-gray-500'}`}>
            {discussion.lastMessage}
          </p>
          {renderCheckIcon()}
        </div>
      </div>

      {discussion.unread > 0 && (
        <motion.span
          className="absolute top-2 right-3 w-4 h-4 bg-[#0a84ff] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{fontSize: '0.5rem'}}
        >
          {discussion.unread > 9 ? '9+' : discussion.id}
        </motion.span>
      )}
    </motion.button>
  );
};

export default DiscussionItem;
