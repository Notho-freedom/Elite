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
  chatHeaderRef={chatHeaderRef},
  isTyping={isTyping}
}) => {
  return (
    <header 
    ref={chatHeaderRef}
      className={`p-3 border-b ${theme.borderColor} flex items-center ${theme.headerBg} sticky top-0 z-10`}
    >
      <button 
        onClick={() => setActiveChat(null)}
        className={`p-2 rounded-full ${theme.hoverBg} mr-2`}
        aria-label="Back to conversations"
      >
        <FiArrowLeft className={theme.textColor} />
      </button>
      
      <div 
        className="flex items-center flex-1 min-w-0 cursor-pointer"
        onClick={() => onStartCall({ 
          ...activeChat, 
          type: 'video' 
        })}
      >
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0 relative">
          {activeChat.avatar && (
            <img 
              src={activeChat.avatar} 
              alt={activeChat.name}
              className="w-full h-full rounded-full object-cover"
            />
          )}
          {activeChat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className={`font-medium ${theme.textColor} truncate`}>{activeChat.name}</h2>
          <div className="flex items-center">
              {isTyping ? (
                <p className={`text-xs ${theme.successText}`}>Typing...</p>
              ) : (
                <p className={`text-xs ${theme.secondaryText}`}>
                  {activeChat.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              )}
            </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => onStartCall({ ...activeChat, type: 'audio' })}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Audio call"
        >
          <FiPhone className={theme.textColor} />
        </button>
        
        <button 
          onClick={() => onStartCall({ ...activeChat, type: 'video' })}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Video call"
        >
          <FiVideo className={theme.textColor} />
        </button>
        
        <button 
          onClick={() => setShowSearch(prev => !prev)}
          className={`p-2 rounded-full ${theme.hoverBg}`}
          aria-label="Search messages"
        >
          <FiSearch className={theme.textColor} />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full ${theme.hoverBg}`}
            aria-label="More options"
          >
            <FiMoreHorizontal className={theme.textColor} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;