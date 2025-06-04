import React, { useState, useMemo } from 'react';
import DiscussionItem from './DiscussionItem';
import { FaFilter, FaSearch, FaTimes, FaChevronCircleDown, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './Context/ThemeContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();
  const t = theme;

  const filteredDiscussions = useMemo(() => {
    let result = discussions;
    
    // Appliquer le filtre sélectionné
    switch (filter) {
      case FILTERS.UNREAD:
        result = result.filter(d => d.unread);
        break;
      case FILTERS.ONLINE:
        result = result.filter(d => d.isOnline);
        break;
      default:
        break;
    }
    
    // Appliquer la recherche si query existe
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) || 
        (d.lastMessage && d.lastMessage.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [filter, discussions, searchQuery]);

  const handleAddFilter = () => {
    alert('Fonction "Ajouter un filtre" à implémenter 😎');
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) setSearchQuery('');
  };

  return (
    <div className={`${theme.w} ${t.bgColor} h-screen flex flex-col`}>
{/* Header principal */}
<motion.div
  className={`px-4 py-3   ${theme.borderColor} flex justify-between items-center ${theme.headerBg}`}
  variants={itemVariants}
>
  <motion.h2 className={`text-lg font-semibold ${theme.textColor}`} variants={itemVariants}>
    Discussions
  </motion.h2>

  <div className="flex items-center space-x-2">

    {/* Bouton filtres */}
    <motion.div className="relative flex gap-4" variants={itemVariants}>

    {/* Bouton recherche */}
    <motion.button
      className={`p-1 rounded-full ${theme.searchHover}`}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={toggleSearch}
      aria-label="Rechercher"
    >
      <FaSearch className={theme.textColor} />
    </motion.button>


      <motion.button
        className={`p-1 rounded-full relative ${theme.searchHover}`}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        aria-label="Filtres"
      >
        <FaCamera  className={`text-xs ${theme.textColor} w-4 h-4`} />
      </motion.button>

      <motion.button
        className={`p-1 rounded-full relative ${theme.searchHover}`}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        aria-label="Filtres"
      >
        <FaChevronCircleDown className={`text-xs ${theme.textColor} w-4 h-4`} />
      </motion.button>
    </motion.div>
  </div>
</motion.div>

{/* Barre de recherche dépliable */}
<AnimatePresence mode="wait">
  {isSearching && (
    <motion.div
      className={`px-4 py-2   ${theme.borderColor} ${theme.headerBg}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="relative">
        {/* Icône recherche */}
        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText}`} />
        
        {/* Input de recherche */}
        <motion.input
          type="text"
          placeholder="Rechercher..."
          className={`w-full pl-9 pr-10 py-2 rounded-full focus:outline-none ${theme.inputBg} ${theme.textColor}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          whileFocus={{ scale: 1.01 }}
        />

        {/* Clear input */}
        {searchQuery && (
          <motion.button
            onClick={() => setSearchQuery('')}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText} ${theme.filterHover}`}
            variants={buttonVariants}
            initial="rest"
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


      <motion.div className={`flex ${t.borderColor} px-4 items-center`} initial="rest" animate="rest">
        {Object.values(FILTERS).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium relative ${
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
                  highlight={searchQuery && (discussion.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (discussion.lastMessage && discussion.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())))}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="no-discussions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col items-center justify-center h-full italic ${t.emptyStateText} p-4`}
            >
              {searchQuery ? (
                <>
                  <div className="text-lg mb-2">Aucun résultat pour "{searchQuery}"</div>
                  <div className="text-sm">Essayez un autre terme de recherche</div>
                </>
              ) : (
                <>
                  <div className="text-lg mb-2">Aucune discussion</div>
                  <div className="text-sm">{filter === FILTERS.UNREAD ? 'Aucun message non lu' : 
                                         filter === FILTERS.ONLINE ? 'Aucun contact en ligne' : 
                                         'Commencez une nouvelle discussion'}</div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(DiscussionList);