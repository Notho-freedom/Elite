import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ChatSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  theme 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`px-4 py-2 border-b ${theme.borderColor} ${theme.headerBg} flex items-center`}
    >
      <FiSearch className={`mr-2 ${theme.secondaryText}`} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`flex-1 bg-transparent ${theme.textColor} focus:outline-none`}
        placeholder="Search messages..."
        autoFocus
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className={`ml-2 p-1 rounded-full ${theme.hoverBg}`}
        >
          ✕
        </button>
      )}
    </motion.div>
  );
};

export default ChatSearch;