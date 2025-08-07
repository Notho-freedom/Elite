import React, { useState, useMemo, useCallback } from 'react';
import { FaFilter, FaSearch, FaTimes, FaChevronCircleDown, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionItem from './DiscussionItem';
import EnhancedDiscussionItem from './Enhanced/EnhancedDiscussionItem';
import TabHeader from './UI/TabHeader';
import { DiscussionStates } from './chat/Enhanced/MessageStates';
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

const EmptyState = ({ filter, searchQuery, theme }) => {
  let message = 'Commencez une nouvelle discussion';
  if (filter === FILTERS.UNREAD) message = 'Aucun message non lu';
  if (filter === FILTERS.ONLINE) message = 'Aucun contact en ligne';

  return (
    <motion.div
      key="no-discussions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center h-full italic ${theme.emptyStateText} p-4`}
    >
      {searchQuery ? (
        <>
          <div className={`text-lg mb-2 ${theme.textColor}`}>Aucun résultat pour "{searchQuery}"</div>
          <div className={`text-sm ${theme.secondaryText}`}>Essayez un autre terme de recherche</div>
        </>
      ) : (
        <>
          <div className={`text-lg mb-2 ${theme.textColor}`}>Aucune discussion</div>
          <div className={`text-sm ${theme.secondaryText}`}>{message}</div>
        </>
      )}
    </motion.div>
  );
};

const DiscussionList = () => {
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { realDiscussions, discussions: mockDiscussions, theme: t, setActiveChat, isMobile, activeChat, isAuthenticated, user } = useApp();
  
  // Utiliser les données réelles si disponibles, sinon les données mockées
  const discussions = realDiscussions.length > 0 ? realDiscussions : mockDiscussions;
  


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
      {/* Header avec TabHeader */}
      <TabHeader
        title={`Discussions ${realDiscussions.length === 0 ? '(Mode Demo)' : ''}`}
        theme={t}
        showSearch={true}
        showCamera={true}
        showMore={true}
        onSearch={setIsSearching}
        onCamera={() => console.log('Camera clicked')}
        onMore={() => console.log('More options clicked')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher une discussion..."
      />

      {/* Message d'information si mode demo */}
      {realDiscussions.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-4 mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className={`text-sm ${t.textColor}`}>
              Mode démonstration - Connectez-vous à Supabase pour voir vos vraies discussions
            </p>
          </div>
        </motion.div>
      )}

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
                <EnhancedDiscussionItem
                  discussion={discussion}
                  onClick={() => setActiveChat(discussion)}
                  theme={t}
                  isActive={activeChat?.id === discussion.id}
                />
              </motion.div>
            ))
          ) : (
            <EmptyState filter={filter} searchQuery={searchQuery} theme={t} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(DiscussionList);
