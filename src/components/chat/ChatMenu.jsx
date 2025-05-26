import { motion } from 'framer-motion';

const ChatMenu = ({ 
  showMenu, 
  theme 
}) => {
  return (
    showMenu && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${theme.bgColor} border ${theme.borderColor} z-20`}
      >
        <div className="py-1">
          <button className={`block w-full text-left px-4 py-2 text-sm ${theme.textColor} hover:${theme.hoverBg}`}>
            View profile
          </button>
          <button className={`block w-full text-left px-4 py-2 text-sm ${theme.textColor} hover:${theme.hoverBg}`}>
            Mute notifications
          </button>
          <button className={`block w-full text-left px-4 py-2 text-sm ${theme.textColor} hover:${theme.hoverBg}`}>
            Clear chat
          </button>
        </div>
      </motion.div>
    )
  );
};

export default ChatMenu;