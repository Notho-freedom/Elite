import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEllipsisH, FaCheck, FaSearch, FaTimes } from 'react-icons/fa';
import { useApp } from '../Context/AppContext';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const Status = () => {
  const {
    theme,
    sortedDiscussions: users = [],
    isMobile,
  } = useApp();

  const [state, setState] = useState({
    activeStatus: null,
    showOptions: false,
    showSearch: false,
    searchTerm: '',
    unreadStatus: [],
    seenStatus: []
  });

  // Mémoïsation du composant SegmentedRing
  const SegmentedRing = useCallback(({ segments = 1, radius = 24, stroke = 3, color = '#3B82F6', active = true }) => {
    const size = radius * 2 + stroke * 2;
    const circumference = 2 * Math.PI * radius;
    const gap = circumference * 0.02;
    const dashLength = (circumference - gap * segments) / segments;

    return (
      <svg width={size} height={size} className="absolute">
        {Array.from({ length: segments }).map((_, i) => (
          <circle
            key={i}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            stroke={active ? color : '#b4b4b4'}
            strokeWidth={stroke}
            strokeDasharray={`${dashLength} ${circumference}`}
            strokeDashoffset={-((dashLength + gap) * i)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
    );
  }, []);

  // Tri et filtrage des statuts
  useEffect(() => {
    if (!users.length) return;

    const sortedUsers = [...users].sort((a, b) => new Date(b.date) - new Date(a.date));
    const unread = sortedUsers.filter(user => user.unread);
    const seen = sortedUsers.filter(user => !user.unread && user.id !== 0);

    setState(prev => ({
      ...prev,
      unreadStatus: unread,
      seenStatus: seen
    }));
  }, [users]);

  // Fonction de recherche
  const filteredStatuses = useMemo(() => {
    if (!state.searchTerm) {
      return {
        unread: state.unreadStatus,
        seen: state.seenStatus
      };
    }

    const searchTerm = state.searchTerm.toLowerCase();
    const filterFn = status => status.name.toLowerCase().includes(searchTerm);

    return {
      unread: state.unreadStatus.filter(filterFn),
      seen: state.seenStatus.filter(filterFn)
    };
  }, [state.searchTerm, state.unreadStatus, state.seenStatus]);

  const addNewStatus = useCallback(() => {
    // Logique pour ajouter un nouveau statut
    console.log('Ajouter un nouveau statut');
  }, []);

  const toggleOptions = useCallback(() => {
    setState(prev => ({ ...prev, showOptions: !prev.showOptions }));
  }, []);

  const toggleSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSearch: !prev.showSearch,
      searchTerm: !prev.showSearch ? '' : prev.searchTerm
    }));
  }, []);

  const markAsSeen = useCallback((index, isUnreadSection) => {
    setState(prev => {
      if (isUnreadSection) {
        const updatedUnread = [...prev.unreadStatus];
        if (!updatedUnread[index]) return prev;
        
        updatedUnread[index].unread = false;
        return {
          ...prev,
          unreadStatus: updatedUnread.filter(user => user.unread),
          seenStatus: [updatedUnread[index], ...prev.seenStatus],
          activeStatus: index + 1
        };
      }
      return { ...prev, activeStatus: index + prev.unreadStatus.length + 1 };
    });
  }, []);

  // Mémoïsation des sections de statuts
  const renderStatusSection = useCallback((title, statuses, isUnread = false) => {
    if (!statuses.length) return null;

    return (
      <div className="px-3 py-2">
        <p className={`text-sm font-medium ${theme.textColor} mb-2`}>
          {title}
        </p>
        {statuses.map((status, index) => (
          <motion.div
            key={`${isUnread ? 'unread' : 'seen'}-${status.id}`}
            className={`flex items-center px-1 py-3 rounded-lg ${theme.itemHover} cursor-pointer`}
            whileHover={{ scale: 1.01 }}
            onClick={() => markAsSeen(index, isUnread)}
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <SegmentedRing segments={status.id} active={status.unread} />
              <img 
                src={status.avatar} 
                alt={status.name}
                className="w-12 h-12 rounded-full object-cover z-10"
                loading="lazy"
              />
            </div>
            <div className="ml-3 flex-1">
              <p className={`font-medium ${theme.textColor}`}>{status.name}</p>
              <p className={`text-xs ${theme.secondaryText}`}>{status.timeDisplay}</p>
            </div>

          </motion.div>
        ))}
      </div>
    );
  }, [theme, markAsSeen]);

  // Votre statut (mémoïsé)
  const myStatus = useMemo(() => {
    if (!users.length) return null;
    
    const shouldShow = !state.searchTerm || 
      users[0].name.toLowerCase().includes(state.searchTerm.toLowerCase());

    if (!shouldShow) return null;

    return (
      <div 
        className={`flex items-center px-4 py-3 ${theme.borderColor} ${theme.itemHover} cursor-pointer`}
        onClick={() => setState(prev => ({ ...prev, activeStatus: 0 }))}
      >
        <div className="relative">
          <div className={`w-14 h-14 rounded-full border-2 ${
            state.activeStatus === 0 ? 'border-blue-500' : theme.borderColor
          } flex items-center justify-center`}>
            <img 
              src={users[0].avatar} 
              alt="Votre statut" 
              className="w-12 h-12 rounded-full object-cover"
              loading="eager"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${
              theme.buttonBg
            } border-2 ${theme.borderColor} flex items-center justify-center`}>
              <FaPlus className="text-xs text-white" />
            </div>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className={`font-medium ${theme.textColor}`}>Mon Statut</p>
          <p className={`text-xs ${theme.secondaryText}`}>Ajouter à mon statut</p>
        </div>
      </div>
    );
  }, [users, theme, state.activeStatus, state.searchTerm]);

  return (
    <motion.div 
      className={`${theme.w} overflow-hidden ${theme.bgColor} h-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={`flex justify-between items-center px-4 py-3 ${
        theme.headerBg} ${theme.borderColor} ${theme.textColor}`}>
        <h3 className="text-lg font-semibold">Statut</h3>
        <div className="flex items-center space-x-3">
          <motion.button 
            className={`p-1 rounded-full ${theme.buttonHover}`}
            onClick={toggleSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Rechercher"
          >
            <FaSearch className={theme.iconColor} />
          </motion.button>
          <motion.button 
            className={`p-1 rounded-full ${theme.buttonHover}`}
            onClick={addNewStatus}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Ajouter un statut"
          >
            <FaPlus className={theme.iconColor} />
          </motion.button>
          <motion.button 
            className={`p-1 rounded-full ${theme.buttonHover}`}
            onClick={toggleOptions}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Options"
          >
            <FaEllipsisH className={theme.iconColor} />
          </motion.button>
        </div>
      </div>

      {/* Barre de recherche */}
      <AnimatePresence>
        {state.showSearch && (
          <motion.div 
            className={`px-4 py-2 ${theme.borderColor}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText}`} />
              <motion.input
                type="text"
                placeholder="Rechercher des statuts..."
                className={`w-full pl-9 pr-4 py-2 rounded-full focus:outline-none ${theme.inputBg} ${theme.textColor}`}
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                whileFocus={{ scale: 1.02 }}
                autoFocus
                aria-label="Rechercher des statuts"
              />
              {state.searchTerm && (
                <motion.button
                  onClick={() => setState(prev => ({ ...prev, searchTerm: '' }))}
                  className={`absolute right-3 top-1/4 transform rounded-full p-0.5 ${theme.buttonGold} ${theme.filterHover}`}
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.1 },
                    tap: { scale: 0.9 }
                  }}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Effacer la recherche"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu déroulant options */}
      <AnimatePresence>
        {state.showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute right-4 mt-2 w-48 rounded-md shadow-lg z-10 text-xs ${
              theme.bgColor} ${theme.borderColor} ${theme.textColor} border overflow-hidden`}
          >
            <div className="py-1">
              <motion.button 
                className={`block w-full text-left px-4 py-2 ${
                  theme.menuItemHover}`}
                whileHover={{ backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#F1F5F9' }}
              >
                Paramètres des statuts
              </motion.button>
              <motion.button 
                className={`block w-full text-left px-4 py-2 ${
                  theme.menuItemHover}`}
                whileHover={{ backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#F1F5F9' }}
              >
                Masquer les statuts
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {myStatus}
      {/* Liste des statuts */}
      <div className={`overflow-y-auto ${isMobile ? 'h-[70%]':'h-[86%]'}`}>
        {filteredStatuses.unread.length > 0 && renderStatusSection('Récents', filteredStatuses.unread, true)}
        {filteredStatuses.seen.length > 0 && renderStatusSection('Déjà vus', filteredStatuses.seen)}
        
        {/* État vide */}
        {state.searchTerm && filteredStatuses.unread.length === 0 && filteredStatuses.seen.length === 0 && (
          <motion.div 
            className={`p-4 text-center ${theme.secondaryText}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Aucun statut trouvé pour "{state.searchTerm}"
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Status);