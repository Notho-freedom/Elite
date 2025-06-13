import React, { useState, useMemo, useCallback } from 'react';
import { FaFilter, FaSearch, FaTimes, FaChevronCircleDown, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionItem from './DiscussionItem';
import { useApp } from './Context/AppContext';

const FILTERS = { ALL: 'all', UNREAD: 'unread', ONLINE: 'online' };

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

const FilterButton = ({ label, isActive, onClick, t }) => (
  <motion.button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium relative ${
      isActive ? 'text-blue-500' :  `${t.secondaryText} ${t.filterHover}`
    }`}
    variants={buttonVariants}
    whileHover="hover"
    whileTap="tap"
  >
    {label.charAt(0).toUpperCase() + label.slice(1)}
    {isActive && (
      <motion.span
        layoutId="underline"
        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"
      />
    )}
  </motion.button>
);

const EmptyState = ({ filter, searchQuery }) => {
  let message = 'Commencez une nouvelle discussion';
  if (filter === FILTERS.UNREAD) message = 'Aucun message non lu';
  if (filter === FILTERS.ONLINE) message = 'Aucun contact en ligne';

  return (
    <motion.div
      key="no-discussions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full italic text-muted p-4"
    >
      {searchQuery ? (
        <>
          <div className="text-lg mb-2">Aucun résultat pour "{searchQuery}"</div>
          <div className="text-sm">Essayez un autre terme de recherche</div>
        </>
      ) : (
        <>
          <div className="text-lg mb-2">Aucune discussion</div>
          <div className="text-sm">{message}</div>
        </>
      )}
    </motion.div>
  );
};

const DiscussionList = () => {
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { sortedDiscussions: discussions, theme: t, setActiveChat, isMobile } = useApp();

  const toggleSearch = useCallback(() => {
    setIsSearching((prev) => !prev);
    if (isSearching) setSearchQuery('');
  }, [isSearching]);

  const handleFilterClick = useCallback((f) => () => setFilter(f), []);
  const handleAddFilter = useCallback(() => alert('Fonction "Ajouter un filtre" à implémenter 😎'), []);

  const filteredDiscussions = useMemo(() => {
    return discussions
      .filter((d) => {
        if (filter === FILTERS.UNREAD) return d.unread;
        if (filter === FILTERS.ONLINE) return d.isOnline;
        return true;
      })
      .filter((d) => {
        const q = searchQuery.toLowerCase();
        return !q || d.name.toLowerCase().includes(q) || (d.lastMessage?.toLowerCase().includes(q));
      });
  }, [filter, discussions, searchQuery]);

  return (
    <div className={`${t.w} ${t.bgColor} h-screen flex flex-col`}>
      {/* Header */}
      <motion.div className={`px-4 py-3 ${t.borderColor} flex justify-between items-center ${t.headerBg}`} variants={itemVariants}>
        <motion.h2 className={`text-lg font-semibold ${t.textColor}`} variants={itemVariants}>
          Discussions
        </motion.h2>

        <div className="flex items-center gap-2">
          <motion.button
            className={`p-1 rounded-full ${t.searchHover}`}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleSearch}
            aria-label="Rechercher"
          >
            <FaSearch className={t.textColor} />
          </motion.button>

          <motion.button className={`p-1 rounded-full ${t.searchHover}`} variants={buttonVariants} aria-label="Camera">
            <FaCamera className={`w-4 h-4 ${t.textColor}`} />
          </motion.button>

          <motion.button className={`p-1 rounded-full ${t.searchHover}`} variants={buttonVariants} aria-label="Plus">
            <FaChevronCircleDown className={`w-4 h-4 ${t.textColor}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            className={`px-4 py-2 ${t.borderColor} ${t.headerBg}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.secondaryText}`} />
              <motion.input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full pl-9 pr-10 py-2 rounded-full focus:outline-none ${t.inputBg} ${t.textColor}`}
                whileFocus={{ scale: 1.01 }}
              />
              {searchQuery && (
                <motion.button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.secondaryText} ${t.filterHover}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Effacer"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <motion.div className={`flex px-4 items-center ${t.borderColor}`} initial="rest" animate="rest">
        {Object.values(FILTERS).map((f) => (
          <FilterButton key={f} label={f} isActive={filter === f} onClick={handleFilterClick(f)} t={t} />
        ))}

        <motion.button
          onClick={handleAddFilter}
          className={`ml-auto flex items-center gap-2 text-sm ${t.secondaryText} ${t.hoverBg} px-3 py-1 rounded-md`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaFilter />
        </motion.button>
      </motion.div>

      {/* Liste des discussions */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden mt-2 ${isMobile ? 'mb-[12vh]':' mb-[1vh]'}`}>
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
                  highlight={
                    !!searchQuery &&
                    (discussion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      discussion.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()))
                  }
                />
              </motion.div>
            ))
          ) : (
            <EmptyState filter={filter} searchQuery={searchQuery} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(DiscussionList);
