import React, { useState, useMemo } from 'react';
import DiscussionItem from './DiscussionItem';
import { FaPlusCircle, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';

const FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
  ONLINE: 'online',
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const DiscussionList = ({ discussions, setActiveChat }) => {
  const [filter, setFilter] = useState(FILTERS.ALL);
  const { theme } = useTheme();
  const t = theme;

  const filteredDiscussions = useMemo(() => {
    switch (filter) {
      case FILTERS.UNREAD:
        return discussions.filter(d => d.unread);
      case FILTERS.ONLINE:
        return discussions.filter(d => d.isOnline);
      case FILTERS.ALL:
      default:
        return discussions;
    }
  }, [filter, discussions]);

  const handleAddFilter = () => {
    // À personnaliser plus tard avec un menu ou modal
    alert('Fonction "Ajouter un filtre" à implémenter 😎');
  };

  return (
    <div className={`${theme.w} ${t.bgColor} h-screen flex flex-col`}>
      <header className={`px-6 py-4 border-b ${t.borderColor} flex justify-between items-center ${t.headerBg}`}>
        <h1 className={`${t.textColor} font-semibold text-lg`}>Discussions</h1>
        <motion.button
          whileHover={{ scale: 1.1, color: '#0a84ff' }}
          whileTap={{ scale: 0.95 }}
          className={`${t.secondaryText} ${t.hoverBg} rounded-md p-1`}
          aria-label="Add new discussion"
        >
          <FaPlusCircle size={20} />
        </motion.button>
      </header>

      <motion.div className={`flex border-b ${t.borderColor} px-4 items-center`} initial="rest" animate="rest">
        {Object.values(FILTERS).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium relative ${
              filter === f ? 'text-blue-500' : `${t.secondaryText} ${t.filterHover}`
            }`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {filter === f && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"
              />
            )}
          </motion.button>
        ))}

        <motion.button
          onClick={handleAddFilter}
          className={`ml-auto flex items-center gap-2 text-sm ${t.secondaryText} ${t.hoverBg} px-3 py-1 rounded-md`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          title="Ajouter un filtre"
        >
          <FaFilter />
          <span></span>
        </motion.button>
      </motion.div>

      <div className="overflow-y-auto overflow-x-hidden scrollbar-thin flex-1">
        <AnimatePresence mode="popLayout">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <DiscussionItem 
                  discussion={discussion}
                  onClick={() => setActiveChat(discussion)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="no-discussions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center justify-center h-full italic ${t.emptyStateText}`}
            >
              Aucun résultat
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(DiscussionList);
