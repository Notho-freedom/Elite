import React, { useState } from 'react';
import { FaSearch, FaTimes, FaChevronCircleDown, FaCamera, FaPlus, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

const TabHeader = ({
  title,
  theme,
  showSearch = true,
  showCamera = false,
  showMore = true,
  showFilter = false,
  showAdd = false,
  onSearch,
  onCamera,
  onMore,
  onFilter,
  onAdd,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  customActions = [],
  className = ''
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (onSearch) onSearch(!isSearchOpen);
  };

  const handleSearchChange = (value) => {
    if (onSearchChange) onSearchChange(value);
  };

  const clearSearch = () => {
    handleSearchChange('');
  };

  return (
    <>
      {/* Header Principal */}
      <motion.div 
        className={`px-4 py-3 border-b ${theme.borderColor} flex justify-between items-center ${theme.headerBg} ${className}`} 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className={`text-lg font-semibold ${theme.textColor}`} 
          variants={itemVariants}
        >
          {title}
        </motion.h2>

        <div className="flex items-center gap-2">
          {/* Bouton de recherche */}
          {showSearch && (
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={toggleSearch}
              aria-label="Rechercher"
            >
              <FaSearch className={`${theme.textColor} w-4 h-4`} />
            </motion.button>
          )}

          {/* Bouton caméra */}
          {showCamera && (
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={onCamera}
              aria-label="Caméra"
            >
              <FaCamera className={`${theme.textColor} w-4 h-4`} />
            </motion.button>
          )}

          {/* Bouton ajouter */}
          {showAdd && (
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={onAdd}
              aria-label="Ajouter"
            >
              <FaPlus className={`${theme.textColor} w-4 h-4`} />
            </motion.button>
          )}

          {/* Bouton filtre */}
          {showFilter && (
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={onFilter}
              aria-label="Filtrer"
            >
              <FaFilter className={`${theme.textColor} w-4 h-4`} />
            </motion.button>
          )}

          {/* Actions personnalisées */}
          {customActions.map((action, index) => (
            <motion.button
              key={index}
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={action.onClick}
              aria-label={action.label}
            >
              {action.icon}
            </motion.button>
          ))}

          {/* Bouton plus/options */}
          {showMore && (
            <motion.button
              className={`p-1 rounded-full ${theme.searchHover}`}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={onMore}
              aria-label="Plus d'options"
            >
              <FaChevronCircleDown className={`${theme.textColor} w-4 h-4`} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {isSearchOpen && showSearch && (
          <motion.div
            className={`px-4 py-2 border-b ${theme.borderColor} ${theme.headerBg}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.secondaryText} w-4 h-4`} />
              <motion.input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className={`w-full pl-9 pr-10 py-2 rounded-full focus:outline-none ${theme.inputBg} ${theme.textColor}`}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500 }}
              />
              {searchQuery && (
                <motion.button
                  onClick={clearSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.secondaryText} ${theme.filterHover}`}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Effacer"
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FaTimes className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TabHeader;
