import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaUsers, FaShieldAlt, FaLock, FaGlobe, FaSearch, FaFilter, FaCog,FaUserPlus,FaRocket,FaFire, FaGem, FaCoins, FaChartLine, FaThumbtack, FaKey, FaUserCheck,FaUserSecret, FaBroadcastTower } from 'react-icons/fa';
import { useGroupStore, useGroupActions, GROUP_TYPES, GROUP_STATES, PRIVACY_TYPES, PARTICIPANT_ROLES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';
import GroupCreator from './GroupCreator';
import GroupParticipants from './GroupParticipants';
import GroupPrivacyManager from './GroupPrivacyManager';
import GroupInvite from './GroupInvite';
import GroupJoinRequests from './GroupJoinRequests';
import GroupSettings from './GroupSettings';
import InstantRoomCreator from './InstantRoomCreator';

const GroupInterface = ({ isCompact = true }) => {
  const { theme } = useApp();
  const { myGroups, discoveredGroups, joinRequests, stats, settings } = useGroupStore();
  const { getActiveGroups, getPinnedGroups } = useGroupActions();
  
  const [activeTab, setActiveTab] = useState('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showInstantRoomCreator, setShowInstantRoomCreator] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPrivacyManager, setShowPrivacyManager] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const activeGroups = getActiveGroups();
  const pinnedGroups = getPinnedGroups();

  const filters = [
    { id: 'all', label: 'Tous', count: activeGroups.length },
    { id: 'pinned', label: 'Épinglés', count: pinnedGroups.length },
    { id: 'private', label: 'Privés', count: activeGroups.filter(g => g.type === GROUP_TYPES.PRIVATE).length },
    { id: 'public', label: 'Publics', count: activeGroups.filter(g => g.type === GROUP_TYPES.PUBLIC).length },
    { id: 'secret', label: 'Secrets', count: activeGroups.filter(g => g.type === GROUP_TYPES.SECRET).length },
    { id: 'instant', label: 'Instant-Rooms', count: activeGroups.filter(g => g.type === GROUP_TYPES.INSTANT_ROOM).length }
  ];

  const getFilteredGroups = () => {
    let filtered = activeGroups;

    // Filtre par type
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'pinned':
          filtered = pinnedGroups;
          break;
        case 'private':
          filtered = activeGroups.filter(g => g.type === GROUP_TYPES.PRIVATE);
          break;
        case 'public':
          filtered = activeGroups.filter(g => g.type === GROUP_TYPES.PUBLIC);
          break;
        case 'secret':
          filtered = activeGroups.filter(g => g.type === GROUP_TYPES.SECRET);
          break;
        case 'instant':
          filtered = activeGroups.filter(g => g.type === GROUP_TYPES.INSTANT_ROOM);
          break;
        default:
          break;
      }
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleCreateGroup = () => {
    setShowCreator(true);
  };

  const handleCreateInstantRoom = () => {
    setShowInstantRoomCreator(true);
  };

  const handleGroupCreated = (newGroup) => {
    setShowCreator(false);
    setShowInstantRoomCreator(false);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleGroupAction = (action, group) => {
    switch (action) {
      case 'participants':
        setSelectedGroup(group);
        setShowParticipants(true);
        break;
      case 'privacy':
        setSelectedGroup(group);
        setShowPrivacyManager(true);
        break;
      case 'invite':
        setSelectedGroup(group);
        setShowInvite(true);
        break;
      case 'settings':
        setSelectedGroup(group);
        setShowSettings(true);
        break;
      case 'join-requests':
        setShowJoinRequests(true);
        break;
      default:
        break;
    }
  };

  const getGroupIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case GROUP_TYPES.PRIVATE: return <FaLock className={`${iconClass} text-blue-500`} />;
      case GROUP_TYPES.PUBLIC: return <FaGlobe className={`${iconClass} text-green-500`} />;
      case GROUP_TYPES.SECRET: return <FaUserSecret className={`${iconClass} text-purple-500`} />;
      case GROUP_TYPES.INSTANT_ROOM: return <FaRocket className={`${iconClass} text-red-500`} />;
      case GROUP_TYPES.BROADCAST: return <FaBroadcastTower className={`${iconClass} text-orange-500`} />;
      default: return <FaUsers className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPrivacyIcon = (privacy) => {
    const iconClass = "w-4 h-4";
    switch (privacy) {
      case PRIVACY_TYPES.PUBLIC: return <FaGlobe className={`${iconClass} text-green-500`} />;
      case PRIVACY_TYPES.PRIVATE: return <FaLock className={`${iconClass} text-blue-500`} />;
      case PRIVACY_TYPES.SECRET: return <FaUserSecret className={`${iconClass} text-purple-500`} />;
      case PRIVACY_TYPES.INVITE_ONLY: return <FaKey className={`${iconClass} text-orange-500`} />;
      case PRIVACY_TYPES.APPROVAL_REQUIRED: return <FaUserCheck className={`${iconClass} text-yellow-500`} />;
      default: return <FaUsers className={`${iconClass} text-gray-500`} />;
    }
  };

  const getGroupPreview = (group) => {
    const previewClass = isCompact ? "w-10 h-10" : "w-16 h-16";
    const iconClass = isCompact ? "w-5 h-5" : "w-8 h-8";
    
    if (group.avatar) {
      return (
        <div className={`${previewClass} rounded-xl overflow-hidden shadow-lg relative group`}>
          <img src={group.avatar} alt={group.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    }

    return (
      <div className={`${previewClass} rounded-xl ${theme.accentBg} flex items-center justify-center shadow-lg`}>
        {getGroupIcon(group.type)}
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

  const tabs = [
    { id: 'my-groups', label: 'Mes Groupes', count: activeGroups.length, icon: <FaUsers /> },
    { id: 'discover', label: 'Découvrir', count: discoveredGroups.length, icon: <FaFire /> },
    { id: 'requests', label: 'Demandes', count: joinRequests.filter(r => r.state === 'pending').length, icon: <FaUserPlus /> }
  ];

  // Version compacte pour le panel droit
  if (isCompact) {
    return (
      <div className={`h-full flex flex-col ${theme.bgColor} ${theme.textColor}`}>
        {/* Header compact */}
        <div className={`flex items-center justify-between p-4 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${theme.accentBg} flex items-center justify-center`}>
              <FaUsers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Groupes</h3>
              <p className={`text-xs ${theme.secondaryText}`}>{activeGroups.length} groupes actifs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateInstantRoom}
              className={`p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white`}
              title="Créer Instant-Room"
            >
              <FaRocket className="w-3 h-3" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateGroup}
              className={`p-1.5 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
              title="Créer Groupe"
            >
              <FaPlus className="w-3 h-3" />
            </motion.button>
          </div>
        </div>

        {/* Search compact */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <FaSearch className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 ${theme.secondaryText}`} />
            <input
              type="text"
              placeholder="Rechercher des groupes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg border ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
            />
          </div>
        </div>

        {/* Filters compact */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFilter === filter.id
                    ? `${theme.accentBg} text-white`
                    : `${theme.buttonSecondary} ${theme.buttonHover}`
                }`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                <span>{filter.label}</span>
                {filter.count > 0 && (
                  <span className={`${theme.accentBg} text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] font-medium`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Groups list compact */}
        <div className="flex-1 overflow-y-auto">
          {getFilteredGroups().length === 0 ? (
            <div className="text-center py-8">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                <FaUsers className="w-6 h-6 text-white" />
              </div>
              <p className={`text-sm ${theme.secondaryText}`}>
                {searchQuery ? 'Aucun groupe trouvé' : 'Aucun groupe actif'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {getFilteredGroups().map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-800 border border-gray-700/30' 
                      : 'hover:bg-gray-50 border border-gray-200/50'
                  }`}
                  onClick={() => handleViewGroup(group)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {getGroupPreview(group)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h4 className={`text-sm font-medium truncate ${theme.textColor}`}>{group.name}</h4>
                        {group.isPinned && (
                          <FaThumbtack className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        )}
                        {group.monetization?.enabled && (
                          <FaCoins className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`flex items-center gap-1 ${theme.secondaryText}`}>
                          {getGroupIcon(group.type)}
                          <span>{group.memberCount} membres</span>
                        </span>
                        <span className={`${theme.secondaryText}`}>
                          {formatTimeAgo(group.lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupAction('participants', group);
                        }}
                        className={`p-1 rounded transition-all ${theme.buttonSecondary} ${theme.buttonHover}`}
                        title="Participants"
                      >
                        <FaUsers className="w-3 h-3" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupAction('privacy', group);
                        }}
                        className={`p-1 rounded transition-all ${theme.buttonSecondary} ${theme.buttonHover}`}
                        title="Confidentialité"
                      >
                        <FaShieldAlt className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer compact */}
        <div className={`p-3 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`${theme.secondaryText}`}>
              {getFilteredGroups().length} groupe{getFilteredGroups().length > 1 ? 's' : ''} affiché{getFilteredGroups().length > 1 ? 's' : ''}
            </span>
            <span className={`${theme.secondaryText}`}>
              {pinnedGroups.length} épinglé{pinnedGroups.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showCreator && (
            <GroupCreator
              onClose={() => setShowCreator(false)}
              onCreated={handleGroupCreated}
              isCompact={true}
            />
          )}
          
          {showInstantRoomCreator && (
            <InstantRoomCreator
              onClose={() => setShowInstantRoomCreator(false)}
              onCreated={handleGroupCreated}
              isCompact={true}
            />
          )}
          
          {showParticipants && selectedGroup && (
            <GroupParticipants
              group={selectedGroup}
              onClose={() => {
                setShowParticipants(false);
                setSelectedGroup(null);
              }}
              isCompact={true}
            />
          )}
          
          {showPrivacyManager && selectedGroup && (
            <GroupPrivacyManager
              group={selectedGroup}
              onClose={() => {
                setShowPrivacyManager(false);
                setSelectedGroup(null);
              }}
              isCompact={true}
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
          
          {showJoinRequests && (
            <GroupJoinRequests
              onClose={() => setShowJoinRequests(false)}
            />
          )}
          
          {showSettings && selectedGroup && (
            <GroupSettings
              onClose={() => {
                setShowSettings(false);
                setSelectedGroup(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Version originale (plein écran)
  return (
    <div className={`h-full flex flex-col ${theme.bgColor} ${theme.textColor} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme.textColor}`}>Groupes Elite</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                  <FaUsers className="w-4 h-4" />
                  <span className="font-medium">{stats.totalGroups.toLocaleString()}</span>
                  <span>groupes</span>
                </span>
                <span className={`flex items-center gap-2 ${theme.goldText}`}>
                  <FaCoins className="w-4 h-4" />
                  <span className="font-medium">{stats.totalMembers}</span>
                  <span>membres</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinRequests(true)}
            className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
            title="Demandes d'adhésion"
          >
            <FaUserPlus className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateInstantRoom}
            className={`p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center gap-3 shadow-lg transition-all duration-200`}
          >
            <FaRocket className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Instant-Room</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateGroup}
            className={`${theme.buttonGold} p-3 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 ${theme.accentShadow}`}
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Nouveau Groupe</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`relative z-10 flex border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 text-center relative transition-all duration-200 ${
              activeTab === tab.id
                ? `${theme.goldText} font-semibold`
                : `${theme.secondaryText} ${theme.filterHover}`
            }`}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`${theme.accentBg} text-white text-xs rounded-full px-2 py-1 min-w-[24px] font-medium shadow-lg`}
                >
                  {tab.count}
                </motion.span>
              )}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute bottom-0 left-0 right-0 h-1 ${theme.accentBg} rounded-t-full`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {activeTab === 'my-groups' && (
          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.secondaryText}`} />
                <input
                  type="text"
                  placeholder="Rechercher des groupes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
              >
                <FaFilter className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? `${theme.accentBg} text-white shadow-lg`
                      : `${theme.buttonSecondary} ${theme.buttonHover}`
                  }`}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  {filter.count > 0 && (
                    <span className={`${theme.accentBg} text-white text-xs rounded-full px-2 py-1 min-w-[20px] font-medium`}>
                      {filter.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Groups Grid */}
            {getFilteredGroups().length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center shadow-2xl`}>
                  <FaPlus className="w-12 h-12 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${theme.textColor}`}>Aucun groupe trouvé</h3>
                <p className={`text-lg mb-8 ${theme.secondaryText}`}>
                  {searchQuery ? 'Aucun groupe ne correspond à votre recherche' : 'Créez votre premier groupe Elite pour commencer'}
                </p>
                <div className="flex items-center gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateGroup}
                    className={`${theme.buttonGold} px-8 py-4 rounded-xl text-lg font-medium shadow-xl transition-all duration-200 ${theme.accentShadow}`}
                  >
                    <FaUsers className="w-5 h-5 inline mr-3" />
                    Créer un groupe
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateInstantRoom}
                    className={`px-8 py-4 rounded-xl text-lg font-medium shadow-xl transition-all duration-200 bg-gradient-to-r from-red-500 to-orange-500 text-white`}
                  >
                    <FaRocket className="w-5 h-5 inline mr-3" />
                    Instant-Room
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="grid gap-6 max-w-6xl mx-auto">
                {getFilteredGroups().map((group, index) => (
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
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                      hoveredGroup === group.id ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'
                    } ${
                      theme === 'dark' 
                        ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50 backdrop-blur-sm' 
                        : 'bg-white/80 hover:bg-white/90 border border-gray-200/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getGroupPreview(group)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {getGroupIcon(group.type)}
                          <span className={`text-sm font-medium ${theme.secondaryText}`}>
                            {formatTimeAgo(group.lastActivity)}
                          </span>
                          {group.isPinned && (
                            <div className="flex items-center gap-1">
                              <FaThumbtack className="w-4 h-4 text-yellow-500" title="Épinglé" />
                            </div>
                          )}
                          {group.monetization?.enabled && (
                            <div className="flex items-center gap-1">
                              <FaCoins className="w-4 h-4 text-yellow-500" title="Monétisé" />
                              <FaGem className="w-3 h-3 text-blue-500" title="Premium" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-xl font-bold mb-2 ${theme.textColor}`}>{group.name}</h3>
                            {group.description && (
                              <p className={`text-base leading-relaxed ${theme.secondaryText} mb-3`}>
                                {group.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                                <FaUsers className="w-4 h-4" />
                                <span className="font-medium">{group.memberCount}</span>
                                <span>membres</span>
                              </span>
                              <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                                <FaChartLine className="w-4 h-4" />
                                <span className="font-medium">{group.stats.totalMessages}</span>
                                <span>messages</span>
                              </span>
                              {group.monetization?.enabled && (
                                <span className={`flex items-center gap-2 ${theme.goldText} font-medium`}>
                                  <FaCoins className="w-4 h-4" />
                                  <span>{group.monetization.price} Elite-Coins</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupAction('participants', group);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                              title="Gérer les participants"
                            >
                              <FaUsers className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupAction('privacy', group);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                              title="Paramètres de confidentialité"
                            >
                              <FaShieldAlt className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupAction('invite', group);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                              title="Inviter des membres"
                            >
                              <FaUserPlus className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupAction('settings', group);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                              title="Paramètres du groupe"
                            >
                              <FaCog className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Effects */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredGroup === group.id ? 1 : 0 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center py-16"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center`}>
              <FaFire className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Découvrir des groupes</h3>
            <p className={`${theme.secondaryText}`}>Explorez les groupes publics et rejoignez des communautés</p>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center py-16"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center`}>
              <FaUserPlus className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Demandes d'adhésion</h3>
            <p className={`${theme.secondaryText}`}>Gérez les demandes d'adhésion à vos groupes</p>
          </motion.div>
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
        
        {showInstantRoomCreator && (
          <InstantRoomCreator
            onClose={() => setShowInstantRoomCreator(false)}
            onCreated={handleGroupCreated}
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
        
        {showPrivacyManager && selectedGroup && (
          <GroupPrivacyManager
            group={selectedGroup}
            onClose={() => {
              setShowPrivacyManager(false);
              setSelectedGroup(null);
            }}
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
        
        {showJoinRequests && (
          <GroupJoinRequests
            onClose={() => setShowJoinRequests(false)}
          />
        )}
        
        {showSettings && selectedGroup && (
          <GroupSettings
            onClose={() => {
              setShowSettings(false);
              setSelectedGroup(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupInterface;
