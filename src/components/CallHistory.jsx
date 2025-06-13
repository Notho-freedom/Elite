import React, { useMemo, useCallback } from 'react';
import { FaPhone, FaVideo, FaSearch, FaTimes, FaChevronCircleDown } from 'react-icons/fa';
import { IoMdCall } from 'react-icons/io';
import { MdCallMade, MdCallReceived } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './Context/AppContext';

const FILTERS = ['all', 'audio', 'video', 'missed'];

const iconsByType = {
  video: <FaVideo className="text-blue-500" />,
  missed: <IoMdCall className="text-red-500 transform rotate-135" />,
  audio: <FaPhone className="text-green-500" />,
};

const containerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: { opacity: 0, x: 30, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const CallDirectionIcon = ({ type }) => {
  switch (type) {
    case 'missed': return <MdCallReceived className="text-red-500" title="Missed Call" />;
    case 'audio': return <MdCallMade className="text-green-500" title="Outgoing Call" />;
    case 'video': return <MdCallReceived className="text-green-500" title="Incoming Call" />;
    default: return <FaPhone className="text-green-500" />;
  }
};

const CallHistory = () => {
  const {
    theme,
    sortedDiscussions,
    loading,
    setActiveCall,
    isMobile
  } = useApp();

  const [state, setState] = React.useState({
    searchTerm: '',
    selectedFilter: 'all',
    showSearch: false,
    expandedGroups: {}
  });

  // Mémoïsation des fonctions de formatage
  const formatDuration = useCallback(seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, []);

  const formatSectionDate = useCallback(dateString => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday.toDateString()) return 'Yesterday';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const formatTime = useCallback(dateString => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Génération des données d'appel mémoïsée
  const calls = useMemo(() => {
    if (!sortedDiscussions?.length) return [];
    
    const callTypes = ['audio', 'video', 'missed'];
    return sortedDiscussions.map(discussion => {
      const callDate = new Date();
      callDate.setDate(callDate.getDate() - Math.floor(Math.random() * 7));
      callDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));

      return {
        id: discussion.id,
        name: discussion.name,
        avatar: discussion.avatar,
        type: callTypes[Math.floor(Math.random() * callTypes.length)],
        date: callDate,
        duration: Math.floor(Math.random() * 1200),
        lastMessage: discussion.lastMessage,
      };
    });
  }, [sortedDiscussions]);

  // Filtrage et groupage mémoïsé
  const { filteredCalls, groupedCalls } = useMemo(() => {
    const filtered = calls.filter(call => {
      const matchesSearch = call.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesFilter = state.selectedFilter === 'all' || call.type === state.selectedFilter;
      return matchesSearch && matchesFilter;
    });

    const grouped = filtered.reduce((acc, call) => {
      const date = new Date(call.date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(call);
      return acc;
    }, {});

    return {
      filteredCalls: filtered,
      groupedCalls: Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a))
    };
  }, [calls, state.searchTerm, state.selectedFilter]);

  // Gestion des événements
  const handleCallClick = useCallback(call => {
    setActiveCall({
      name: call.name,
      avatar: call.avatar,
      status: call.type === 'video' ? 'FaceTime Video' : 'FaceTime Audio',
      isMuted: false,
      isVideoOn: call.type === 'video',
      isScreenSharing: false,
    });
  }, [setActiveCall]);

  const toggleSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSearch: !prev.showSearch,
      searchTerm: !prev.showSearch ? '' : prev.searchTerm
    }));
  }, []);

  const toggleGroup = useCallback(date => {
    setState(prev => ({
      ...prev,
      expandedGroups: {
        ...prev.expandedGroups,
        [date]: !prev.expandedGroups[date]
      }
    }));
  }, []);

  // Effet pour développer les groupes par défaut
  React.useEffect(() => {
    if (groupedCalls.length > 0 && Object.keys(state.expandedGroups).length === 0) {
      groupedCalls.forEach(([date]) => {
        toggleGroup(date);
      });
    }
  }, [groupedCalls, state.expandedGroups, toggleGroup]);

  return (
    <motion.div
      className={`${theme.w} flex flex-col h-full overflow-hidden shadow-lg ${theme.textColor}`}
      exit="exit"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className={`${theme.headerBg} px-4 py-3 ${theme.borderColor} flex justify-between items-center`}
        variants={itemVariants}
      >
        <motion.h2 className={`text-lg font-semibold ${theme.textColor}`} variants={itemVariants}>
          Appels
        </motion.h2>
        <div className="flex items-center space-x-2">
          <motion.div className="relative flex gap-4" variants={itemVariants}>
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
              <FaChevronCircleDown className={`text-xs ${theme.textColor} w-4 h-4`} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search Bar - Conditionally Rendered */}
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
              <FaSearch 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText}`} 
                aria-hidden="true"
              />
              <motion.input
                type="text"
                placeholder="Search calls..."
                className={`w-full pl-9 pr-4 py-2 rounded-full focus:outline-none ${theme.inputBg} ${theme.textColor}`}
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                whileFocus={{ 
                  scale: 1.02,
                  boxShadow: `0 0 0 2px ${theme.mode === 'dark' ? '#3b82f6' : '#93c5fd'}`
                }}
                autoFocus
                aria-label="Search calls"
                transition={{ type: 'spring', stiffness: 500 }}
              />
              <AnimatePresence>
                {state.searchTerm && (
                  <motion.button
                    onClick={() => setState(prev => ({ ...prev, searchTerm: '' }))}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.secondaryText} ${theme.filterHover}`}
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    aria-label="Clear search"
                    exit={{ opacity: 0 }}
                  >
                    <FaTimes />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <motion.div className={`flex ${theme.borderColor} px-4`} variants={itemVariants}>
        {FILTERS.map(filter => (
          <motion.button
            key={filter}
            className={`px-3 py-2 text-sm font-medium relative ${
              state.selectedFilter === filter
                ? 'text-blue-500'
                : `${theme.secondaryText} ${theme.filterHover}`
            }`}
            onClick={() => setState(prev => ({ ...prev, selectedFilter: filter }))}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {state.selectedFilter === filter && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-md"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Call List */}
      <motion.div className={`flex-1 overflow-y-auto overflow-x-hidden mt-2 ${isMobile ? 'mb-[12vh]':' mb-[1vh]'}`} variants={itemVariants}>
        {loading ? (
          <motion.div className={`p-4 text-center ${theme.secondaryText}`} variants={itemVariants}>
            Loading calls...
          </motion.div>
        ) : filteredCalls.length === 0 ? (
          <motion.div className={`p-4 text-center ${theme.emptyStateText}`} variants={itemVariants}>
            {state.searchTerm ? 'No matching calls found' : 'No calls found'}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {groupedCalls.map(([date, calls], groupIndex) => {
              const isExpanded = !state.expandedGroups[date];

              return (
                <motion.div key={date} layout className="relative">
                  {groupIndex > 0 && (
                    <div className={`absolute left-6 top-0 w-0.5 h-full ${theme.borderColor}`} 
                         style={{ transform: 'translateX(24px)' }} />
                  )}

                  <motion.div
                    className={`flex justify-between items-center px-4 py-3 ${theme.headerBg} ${theme.borderColor} sticky top-0 z-10`}
                    onClick={() => toggleGroup(date)}
                  >
                    <motion.h4 className={`text-base ${theme.textColor}`} variants={itemVariants}>
                      {formatSectionDate(date)}
                    </motion.h4>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-lg ${theme.secondaryText}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {calls.map((call) => (
                          <motion.div
                            key={call.id}
                            className={`flex items-center px-3 py-3 cursor-pointer ${theme.hoverBg} pl-5`}
                            onClick={() => handleCallClick(call)}
                            variants={itemVariants}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            whileHover={{ scale: 1.01 }}
                          >
                            <img
                              src={call.avatar}
                              alt={call.name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h6 className={`truncate ${call.type === 'missed' ? 'text-red-500' : theme.textColor}`}>
                                  {call.name}
                                </h6>
                                <span className={`text-xs font-mono ${theme.secondaryText} whitespace-nowrap ml-2`}>
                                  {formatTime(call.date)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-0.5">
                                <div className="flex items-center space-x-2 text-sm text-gray-500 truncate">
                                  <CallDirectionIcon type={call.type} />
                                  <span className="truncate">
                                    {call.type === 'missed' ? 'Missed Call' : formatDuration(call.duration)}
                                  </span>
                                </div>
                                <div className="flex-shrink-0">
                                  {iconsByType[call.type]}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(CallHistory);