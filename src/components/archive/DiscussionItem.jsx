import { motion } from 'framer-motion';
import { useTheme } from './Context/ThemeContext';
import { BsCheck2, BsCheck2All } from 'react-icons/bs';

const DiscussionItem = ({ discussion, onClick }) => {
  const { theme } = useTheme();

  const renderStatusIndicator = () => {
    // Si message non lu → pastille de notification
    if (discussion.unread > 0) {
      return (
        <motion.span
          className="w-4 h-4 bg-[#0a84ff] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{fontSize: '0.5rem'}}
        >
          {discussion.id > 9 ? '+9' : discussion.id}
        </motion.span>
      );
    }
    
    // Si message envoyé et lu par le destinataire → double check bleu
    if (discussion.isRead) {
      return <BsCheck2All className="text-xs text-blue-400 ml-2" />;
    }
    
    // Si message envoyé mais non lu → simple check gris
    if (discussion.isReceived) {
      return <BsCheck2 className="text-xs text-gray-400 ml-2" />;
    }
    
    // Par défaut (messages lus et reçus) → rien
    return null;
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center px-3 py-3 transition-colors ${theme.hoverBg}`}
      onClick={onClick}
      aria-label={`Discussion avec ${discussion.name}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="relative">
        <img
          src={discussion.avatar}
          alt={`${discussion.name}`}
          className="w-12 h-12 rounded-full border-2 border-transparent"
          style={discussion.actu ? { borderColor: '#0a84ff' } : {}}
        />
        {discussion.isOnline && (
          <span className={`${theme.borderColor} absolute bottom-0 right-0 w-3 h-3 bg-green-500 border rounded-full`} />
        )}
      </div>

      <div className="ml-4 flex-1 text-left overflow-hidden">
        <div className="flex justify-between">
          <p className={`font-semibold text-sm truncate ${theme.textColor}`}>
            {discussion.name}
          </p>
          <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {discussion.timeDisplay}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate ${discussion.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
            {discussion.lastMessage}
          </p>
          {renderStatusIndicator()}
        </div>
      </div>
    </motion.button>
  );
};

export default DiscussionItem;