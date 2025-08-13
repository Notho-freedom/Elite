import { FiArrowLeft, FiVideo, FiPhone, FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ChatHeader = ({
  activeChat,
  setActiveChat,
  onStartCall,
  setShowSearch,
  showMenu,
  setShowMenu,
  theme,
  chatHeaderRef,
  isTyping,
  onProfileOpen,
  onOpenSettings,
}) => {
  const handleProfileClick = () => {
    onProfileOpen();
  };

  return (
    <motion.header
      ref={chatHeaderRef}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-2 lg:p-3 border-b ${theme.borderColor} flex items-center justify-between ${theme.headerBg} sticky top-0 z-auto`}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={handleProfileClick}
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
          className={`p-2 hidden md:flex rounded-full ${theme.hoverBg}`}
          aria-label="Search messages"
        >
          <FiSearch className={theme.textColor} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Discussion settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="More options"
        >
          <FiMoreHorizontal className={theme.textColor} />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default ChatHeader;