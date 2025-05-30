import { motion, AnimatePresence } from 'framer-motion';

const ChatMenu = ({ showMenu, theme }) => {
  return (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`absolute right-2 top-14 w-48 rounded-md shadow-xl ${theme.bgColor} border ${theme.borderColor} z-20`}
        >
          <div className="py-1">
            {['View profile', 'Mute notifications', 'Clear chat'].map((label, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block w-full text-left px-4 py-2 text-sm ${theme.textColor} hover:${theme.hoverBg}`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatMenu;
