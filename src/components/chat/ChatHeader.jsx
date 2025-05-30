import { FiArrowLeft, FiVideo, FiPhone, FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ChatHeader = ({
  activeChat,
  setActiveChat,
  onStartCall,
  setShowSearch,
  showMenu,
  setShowMenu,
  theme,
  chatHeaderRef,
  isTyping
}) => {
  return (
    <motion.header
      ref={chatHeaderRef}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-2 lg:p-3 border-b ${theme.borderColor} flex items-center justify-between ${theme.headerBg} sticky top-0 z-10`}
    >
      {/* Back Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveChat(null)}
        className={`p-0 rounded-full ${theme.hoverBg} mr-2`}
        aria-label="Back to conversations"
      >
        <FiArrowLeft className={theme.textColor} />
      </motion.button>

      {/* Avatar + Info */}
      <motion.div
        className="flex items-center flex-1 min-w-0 cursor-pointer overflow-hidden"
        onClick={() => onStartCall({ ...activeChat, type: 'video' })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0 relative"
          whileHover={{ scale: 1.05 }}
        >
          {activeChat.avatar && (
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-full h-full rounded-full object-cover"
            />
          )}
          {activeChat.isOnline && (
            <motion.div
              layout
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <h2 className={`font-medium ${theme.textColor} truncate text-sm sm:text-base`}>
            {activeChat.name}
          </h2>
          <p className={`text-xs ${isTyping ? theme.successText : theme.secondaryText}`}>
            {isTyping ? 'Typing...' : activeChat.isOnline ? 'Online' : 'Last seen recently'}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onStartCall({ ...activeChat, type: 'audio' })}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Audio call"
        >
          <FiPhone className={theme.textColor} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onStartCall({ ...activeChat, type: 'video' })}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Video call"
        >
          <FiVideo className={theme.textColor} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSearch(prev => !prev)}
          className={`p-2 d-none md:flex lg:flex rounded-full ${theme.hoverBg}`}
          aria-label="Search messages"
        >
          <FiSearch className={theme.textColor} />
        </motion.button>

        <motion.div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full ${theme.hoverBg}`}
            aria-label="More options"
          >
            <FiMoreHorizontal className={theme.textColor} />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default ChatHeader;
