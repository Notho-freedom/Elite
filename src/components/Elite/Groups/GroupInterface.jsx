import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaUsers, FaLock, FaGlobe, FaCrown, FaUser , FaEye, FaCoins, FaChartLine, FaCog, FaTimes, FaSearch, FaFilter, FaThumbtack, FaArchive, FaVolumeMute, FaVolumeUp, FaShieldAlt, FaUserFriends, FaRocket, FaStar, FaFire, FaGem, FaEllipsisV, FaEdit, FaTrash, FaBan, FaCheck, FaClock, FaUserPlus, FaBell, FaBellSlash, FaList, FaTh, FaCompress, FaBroadcastTower, FaChevronDown } from 'react-icons/fa';
import { useGroupStore, useGroupActions, GROUP_TYPES, PRIVACY_TYPES, PARTICIPANT_ROLES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';
import GroupCreator from './GroupCreator';
import GroupSettings from './GroupSettings';
import GroupParticipants from './GroupParticipants';
import GroupJoinRequests from './GroupJoinRequests';
import GroupInvite from './GroupInvite';
import { Menu } from '@headlessui/react'

const GroupInterface = () => {
  const { theme, setActiveChat } = useApp();
  const { myGroups, discoveredGroups, stats, settings, ui } = useGroupStore();
  const { getActiveGroups, getPinnedGroups } = useGroupActions();
  
  const [activeTab, setActiveTab] = useState('my-groups');
  const [showCreator, setShowCreator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('compact'); // list, grid, compact
  const [sortBy, setSortBy] = useState('lastActivity'); // lastActivity, name, memberCount, createdAt

  const activeGroups = getActiveGroups();
  const pinnedGroups = getPinnedGroups();

  // Filtrage et tri des groupes
  const getFilteredGroups = () => {
    let filtered = activeGroups;

    // Filtre par type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(group => {
        switch (selectedFilter) {
          case 'private':
            return group.type === GROUP_TYPES.PRIVATE;
          case 'public':
            return group.type === GROUP_TYPES.PUBLIC;
          case 'secret':
            return group.type === GROUP_TYPES.SECRET;
          case 'instant-rooms':
            return group.type === GROUP_TYPES.INSTANT_ROOM;
          case 'broadcast':
            return group.type === GROUP_TYPES.BROADCAST;
          case 'pinned':
            return group.isPinned;
          case 'monetized':
            return group.monetization?.enabled;
          default:
            return true;
        }
      });
    }

    // Recherche
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'memberCount':
          return b.memberCount - a.memberCount;
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'lastActivity':
        default:
          return new Date(b.lastActivity) - new Date(a.lastActivity);
      }
    });

    return filtered;
  };

  const handleCreateGroup = () => {
    setShowCreator(true);
  };

  const handleGroupCreated = (newGroup) => {
    setShowCreator(false);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    // TODO: Navigate to group chat
    setActiveChat(group);
  };

  const handleGroupAction = (action, group) => {
    switch (action) {
      case 'pin':
        useGroupStore.getState().pinGroup(group.id);
        break;
      case 'mute':
        useGroupStore.getState().muteGroup(group.id);
        break;
      case 'archive':
        useGroupStore.getState().archiveGroup(group.id);
        break;
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
          useGroupStore.getState().deleteGroup(group.id);
        }
        break;
      case 'participants':
        setSelectedGroup(group);
        setShowParticipants(true);
        break;
      case 'invite':
        setSelectedGroup(group);
        setShowInvite(true);
        break;
      case 'settings':
        setSelectedGroup(group);
        setShowSettings(true);
        break;
    }
  };

  const getGroupIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case GROUP_TYPES.PRIVATE:
        return <FaLock className={`${iconClass} text-blue-500`} />;
      case GROUP_TYPES.PUBLIC:
        return <FaGlobe className={`${iconClass} text-green-500`} />;
      case GROUP_TYPES.SECRET:
        return <FaShieldAlt className={`${iconClass} text-purple-500`} />;
      case GROUP_TYPES.INSTANT_ROOM:
        return <FaRocket className={`${iconClass} text-red-500`} />;
      case GROUP_TYPES.BROADCAST:
        return <FaBroadcastTower className={`${iconClass} text-orange-500`} />;
      default:
        return <FaUsers className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPrivacyIcon = (privacy) => {
    const iconClass = "w-3 h-3";
    switch (privacy) {
      case PRIVACY_TYPES.PRIVATE:
        return <FaLock className={`${iconClass} text-blue-500`} />;
      case PRIVACY_TYPES.PUBLIC:
        return <FaGlobe className={`${iconClass} text-green-500`} />;
      case PRIVACY_TYPES.SECRET:
        return <FaShieldAlt className={`${iconClass} text-purple-500`} />;
      case PRIVACY_TYPES.APPROVAL_REQUIRED:
        return <FaUserFriends className={`${iconClass} text-orange-500`} />;
      default:
        return <FaEye className={`${iconClass} text-gray-500`} />;
    }
  };

  const getGroupPreview = (group) => {
    const previewClass = "w-14 h-14 rounded-xl overflow-hidden shadow-lg";
    const iconClass = "w-4 h-4";
    
    if (group.avatar) {
      return (
        <div className={`${previewClass} relative group`}>
          <img src={group.avatar} alt={group.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {group.isPinned && (
            <div className="absolute top-1 left-1">
              <FaThumbtack className="w-3 h-3 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`${previewClass} ${theme.accentBg} flex items-center justify-center relative`}>
        <FaUsers className={`${iconClass} text-white`} />
        {group.isPinned && (
          <div className="absolute top-1 left-1">
            <FaThumbtack className="w-3 h-3 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
    );
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  const filters = [
    { id: 'all', label: 'Tous', count: activeGroups.length, icon: <FaUsers /> },
    { id: 'private', label: 'Privés', count: activeGroups.filter(g => g.type === GROUP_TYPES.PRIVATE).length, icon: <FaLock /> },
    { id: 'public', label: 'Publics', count: activeGroups.filter(g => g.type === GROUP_TYPES.PUBLIC).length, icon: <FaGlobe /> },
    { id: 'secret', label: 'Secrets', count: activeGroups.filter(g => g.type === GROUP_TYPES.SECRET).length, icon: <FaShieldAlt /> },
    { id: 'instant-rooms', label: 'Instants-Rooms', count: activeGroups.filter(g => g.type === GROUP_TYPES.INSTANT_ROOM).length, icon: <FaRocket /> },
    { id: 'pinned', label: 'Épinglés', count: pinnedGroups.length, icon: <FaThumbtack /> },
    { id: 'monetized', label: 'Monétisés', count: activeGroups.filter(g => g.monetization?.enabled).length, icon: <FaCoins /> }
  ];

  const sortOptions = [
    { value: 'lastActivity', label: 'Activité récente', icon: <FaClock /> },
    { value: 'name', label: 'Nom', icon: <FaUsers /> },
    { value: 'memberCount', label: 'Membres', icon: <FaUserFriends /> },
    { value: 'createdAt', label: 'Date de création', icon: <FaStar /> }
  ];

  const filteredGroups = getFilteredGroups();

  return (
    <div className={`h-full flex flex-col ${theme.bgColor} ${theme.textColor} relative overflow-hidden w-full`}>
      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between p-2 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className={`text-xl font-bold ${theme.textColor}`}>Groupes</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center gap-1 ${theme.secondaryText}`}>
                  <FaUsers className="w-4 h-4" />
                  <span className="font-medium">{stats.totalGroups}</span>
                  <span>groupes</span>
                </span>
                <span className={`flex items-center gap-1 ${theme.goldText}`}>
                  <FaUser className="w-4 h-4" />
                  <span className="font-medium">{stats.totalMembers}</span>
                  <span>membres</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">

    
            {/* Bouton de recherche */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearching(!isSearching)}
              className={`p-2 rounded-full ${theme.hoverBg} ${theme.textColor}`}
            >
              <FaSearch className="w-4 h-4" />
            </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
            title="Paramètres"
          >
            <FaCog className="w-3 h-3" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinRequests(true)}
            className={`p-2 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200 relative`}
            title="Demandes d'adhésion"
          >
            <FaUserPlus className="w-3 h-3" />
            {useGroupStore.getState().joinRequests.filter(r => r.state === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {useGroupStore.getState().joinRequests.filter(r => r.state === 'pending').length}
              </span>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title='Créer un groupe'
            onClick={handleCreateGroup}
            className={`${theme.buttonGold} p-2 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 ${theme.accentShadow}`}
          >
            <FaPlus className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`relative z-10 p-4 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.secondaryText} w-4 h-4`} />
                <input
                  type="text"
                  placeholder="Rechercher des groupes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.targetheme.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.secondaryText}`}
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


{/* Filters and Controls */}
<div className="flex flex-col md:flex-row items-start justify-between gap-2">

  {/* Filter Dropdown */}
  <div className="relative">
    <select
      value={selectedFilter}
      onChange={(e) => setSelectedFilter(e.target.value)}
      className={`px-3 py-2 min-w-[140px] rounded-lg border ${theme.borderColor} ${theme.inputBg} text-sm font-medium focus:outline-none focus:ring-2 ${theme.focusRing}`}
    >
      {filters.map((filter) => (
        <option key={filter.id} value={filter.id}>
          {filter.label} {filter.count > 0 ? `(${filter.count})` : ''}
        </option>
      ))}
    </select>
  </div>

  {/* View Controls */}
  <div className="flex items-center gap-2 shrink-0">
    
    {/* Sort Dropdown */}
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={`px-1 py-2 min-w-[80px] rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing} text-sm`}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    {/* View Toggle */}
    <div className={`flex items-center rounded-lg border ${theme.borderColor} overflow-hidden`}>
      {['list', 'grid', 'compact'].map((mode) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode(mode)}
          className={`p-2 transition-all duration-200 ${
            viewMode === mode
              ? `${theme.accentBg} text-white`
              : `${theme.buttonSecondary} ${theme.buttonHover}`
          }`}
          title={`Vue ${mode}`}
        >
          {mode === 'list' && <FaList className="w-4 h-4" />}
          {mode === 'grid' && <FaTh className="w-4 h-4" />}
          {mode === 'compact' && <FaCompress className="w-4 h-4" />}
        </motion.button>
      ))}
    </div>
  </div>
</div>



        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center shadow-2xl`}>
              <FaUsers className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${theme.textColor}`}>
              {searchQuery ? 'Aucun groupe trouvé' : 'Aucun groupe actif'}
            </h3>
            <p className={`text-lg mb-8 ${theme.secondaryText}`}>
              {searchQuery 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Créez votre premier groupe Elite pour commencer à collaborer'
              }
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateGroup}
                className={`${theme.buttonGold} px-8 py-4 rounded-xl text-lg font-medium shadow-xl transition-all duration-200 ${theme.accentShadow}`}
              >
                <FaPlus className="w-5 h-5 inline mr-3" />
                Créer un groupe Elite
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredGroup(group.id)}
                onHoverEnd={() => setHoveredGroup(null)}
                onClick={() => handleViewGroup(group)}
                className={`group cursor-pointer transition-all duration-300 transform ${
                  hoveredGroup === group.id ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'
                } ${
                  theme === 'dark' 
                    ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50 backdrop-blur-sm' 
                    : 'bg-white/80 hover:bg-white/90 border border-gray-200/50 backdrop-blur-sm'
                } ${
                  viewMode === 'compact' ? 'p-3 rounded-lg' : 'p-6 rounded-2xl'
                }`}
              >
                <div className={`flex items-start gap-4 ${viewMode === 'compact' ? 'gap-3' : ''}`}>
                  <div className="flex-shrink-0">
                    {getGroupPreview(group)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {getGroupIcon(group.type)}
                      <span className={`text-sm font-medium ${theme.secondaryText}`}>
                        {formatTimeAgo(group.lastActivity)}
                      </span>
                      {getPrivacyIcon(group.privacy)}
                      {group.isPinned && <FaThumbtack className="w-4 h-4 text-amber-500" />}
                      {group.isMuted && <FaVolumeMute className="w-4 h-4 text-gray-500" />}
                      {group.monetization?.enabled && (
                        <div className="flex items-center gap-1">
                          <FaCoins className="w-4 h-4 text-yellow-500" />
                          <FaGem className="w-3 h-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${theme.textColor} truncate`}>
                          {group.name}
                        </h3>
                        {viewMode !== 'compact' && (
                          <p className={`text-sm ${theme.secondaryText} line-clamp-2`}>
                            {group.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                          <FaUsers className="w-4 h-4" />
                          <span className="font-medium">{group.memberCount}</span>
                        </span>
                        {group.unreadCount > 0 && (
                          <span className={`${theme.accentBg} text-white text-xs rounded-full px-2 py-1 font-medium`}>
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredGroup === group.id ? 1 : 0 }}
                  className="absolute top-2 right-2 flex items-center gap-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupAction('pin', group);
                    }}
                    className={`p-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                    title={group.isPinned ? 'Désépingler' : 'Épingler'}
                  >
                    <FaThumbtack className={`w-4 h-4 ${group.isPinned ? 'text-amber-500' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupAction('mute', group);
                    }}
                    className={`p-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                    title={group.isMuted ? 'Activer les notifications' : 'Muet'}
                  >
                    {group.isMuted ? <FaBell className="w-4 h-4" /> : <FaBellSlash className="w-4 h-4" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupAction('participants', group);
                    }}
                    className={`p-2 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
                    title="Gérer les participants"
                  >
                    <FaUserFriends className="w-4 h-4" />
                  </motion.button>
                </motion.div>
                
                {/* Hover Effects */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredGroup === group.id ? 1 : 0 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 pointer-events-none"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreator && (
          <GroupCreator
            onClose={() => setShowCreator(false)}
            onCreated={handleGroupCreated}
          />
        )}
        
        {showSettings && (
          <GroupSettings
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {showParticipants && selectedGroup && (
          <GroupParticipants
            group={selectedGroup}
            onClose={() => {
              setShowParticipants(false);
              setSelectedGroup(null);
            }}
          />
        )}
        
        {showJoinRequests && (
          <GroupJoinRequests
            onClose={() => setShowJoinRequests(false)}
          />
        )}
        
        {showInvite && selectedGroup && (
          <GroupInvite
            group={selectedGroup}
            onClose={() => {
              setShowInvite(false);
              setSelectedGroup(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupInterface;
