import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFilter, FaSearch, FaTimes, FaChevronCircleDown, FaCamera, 
  FaPlus, FaEllipsisV, FaStar, FaThumbtack, FaLock, FaArchive,
  FaUsers, FaBroadcastTower, FaCog, FaUserPlus, FaDownload,
  FaUpload, FaEye, FaEyeSlash, FaCrown, FaCoins, FaShieldAlt,
  FaBell, FaBellSlash, FaVolumeUp, FaVolumeMute, FaCheck,
  FaCheckDouble, FaClock, FaCalendar, FaMapMarkerAlt, FaPhone,
  FaVideo, FaMicrophone, FaPaperPlane, FaReply, FaForward,
  FaEdit, FaTrash, FaCopy, FaLink, FaHeart, FaRegHeart,
  FaBookmark, FaRegBookmark, FaFlag, FaBan, FaExclamationTriangle
} from 'react-icons/fa';
import { BsThreeDotsVertical, BsEmojiSmile, BsRecordCircle } from 'react-icons/bs';
import { IoMdNotifications, IoMdNotificationsOff } from 'react-icons/io';
import { MdVerified, MdBlock, MdReport, MdSecurity } from 'react-icons/md';
import { DiscussionStates } from '../chat/Enhanced/MessageStates';
import { useApp } from '../Context/AppContext';
import { useAuth } from '../Context/AuthContext';
import { useDiscussionActions } from '../../lib/eliteStoreSimple';
import { useActionNotifications } from '../Elite/Actions/ActionNotification';
import CreateDiscussionModal from '../Elite/Creation/CreateDiscussionModal';
import EliteWallet from '../Elite/Wallet/EliteWallet';
import CallButtons from '../Elite/Calls/CallButtons';
import { db, supabase } from '../../lib/supabase';

// Composants de filtres avancés
const FilterSection = ({ activeFilter, onFilterChange, theme, discussions, isShowingFilters, toggleFilters }) => {
  const filters = useMemo(() => [
    { 
      id: 'all', 
      label: 'Toutes', 
      icon: <FaUsers />, 
      count: discussions.length 
    },
    { 
      id: 'unread', 
      label: 'Non lues', 
      icon: <FaBell />, 
      count: discussions.filter(d => d.unread).length 
    },
    { 
      id: 'online', 
      label: 'En ligne', 
      icon: <FaCheck />, 
      count: discussions.filter(d => d.isOnline).length 
    },
    { 
      id: 'pinned', 
      label: 'Épinglées', 
      icon: <FaThumbtack />, 
      count: discussions.filter(d => d.isPinned).length 
    },
    { 
      id: 'archived', 
      label: 'Archivées', 
      icon: <FaArchive />, 
      count: discussions.filter(d => d.isArchived).length 
    },
    { 
      id: 'favorites', 
      label: 'Favoris', 
      icon: <FaStar />, 
      count: discussions.filter(d => d.isFavorite).length 
    },
    { 
      id: 'locked', 
      label: 'Verrouillées', 
      icon: <FaLock />, 
      count: discussions.filter(d => d.isLocked).length 
    },
  ], [discussions]);

return (
  <motion.div 
    className={` ${isShowingFilters ? '' : 'hidden'} flex flex-wrap items-center gap-1 px-2 py-2 border-b ${theme.borderColor}`}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {filters.map((filter) => (
      <motion.button
        key={filter.id}
        onClick={() => onFilterChange(filter.id)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap
          transition-all duration-200 relative
          ${activeFilter === filter.id 
            ? `${theme.accentBg} text-white shadow-md` 
            : `${theme.hoverBg} ${theme.textColor} hover:${theme.accentBg} hover:text-white`
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {filter.icon}
        <span>{filter.label}</span>
        {filter.count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
              ${activeFilter === filter.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}
            `}
          >
            {filter.count > 9 ? '9+' : filter.count}
          </motion.span>
        )}
      </motion.button>
    ))}
  </motion.div>
);

};

// Menu contextuel pour les discussions
const DiscussionContextMenu = ({ discussion, isVisible, position, onClose, onAction, theme }) => {
  const menuItems = [
    {
      id: 'pin',
      label: discussion?.isPinned ? 'Désépingler' : 'Épingler',
      icon: <FaThumbtack />,
      color: 'text-blue-600'
    },
    {
      id: 'favorite',
      label: discussion?.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
      icon: <FaStar />,
      color: 'text-yellow-600'
    },
    {
      id: 'archive',
      label: discussion?.isArchived ? 'Désarchiver' : 'Archiver',
      icon: <FaArchive />,
      color: 'text-gray-600'
    },
    {
      id: 'lock',
      label: discussion?.isLocked ? 'Déverrouiller' : 'Verrouiller',
      icon: <FaLock />,
      color: 'text-red-600'
    },
    { id: 'divider' },
    {
      id: 'mute',
      label: discussion?.isMuted ? 'Activer les notifications' : 'Muet',
      icon: discussion?.isMuted ? <IoMdNotifications /> : <IoMdNotificationsOff />,
      color: 'text-orange-600'
    },
    {
      id: 'mark-read',
      label: 'Marquer comme lu',
      icon: <FaCheck />,
      color: 'text-green-600'
    },
    { id: 'divider' },
    {
      id: 'forward',
      label: 'Transférer',
      icon: <FaForward />,
      color: 'text-purple-600'
    },
    {
      id: 'export',
      label: 'Exporter la conversation',
      icon: <FaDownload />,
      color: 'text-indigo-600'
    },
    { id: 'divider' },
    {
      id: 'block',
      label: 'Bloquer',
      icon: <MdBlock />,
      color: 'text-red-600'
    },
    {
      id: 'report',
      label: 'Signaler',
      icon: <MdReport />,
      color: 'text-orange-600'
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: <FaTrash />,
      color: 'text-red-600'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`
              fixed z-50 min-w-[200px] py-2 rounded-lg shadow-xl border
              ${theme.bgColor} ${theme.borderColor}
            `}
            style={{
              left: position.x,
              top: position.y
            }}
          >
            {menuItems.map((item, index) => (
              item.id === 'divider' ? (
                <div key={index} className={`h-px mx-2 my-1 ${theme.borderColor}`} />
              ) : (
                <motion.button
                  key={item.id}
                  onClick={() => onAction(item.id, discussion)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-sm
                    hover:${theme.hoverBg} transition-colors duration-150
                    ${theme.textColor}
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              )
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Composant de discussion Elite amélioré
const EliteDiscussionItem = ({ 
  discussion, 
  onClick, 
  theme, 
  isActive = false,
  onContextMenu,
  onQuickAction
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'Aucun message';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const getStatusIcon = () => {
    if (discussion?.isVerified) return <MdVerified className="text-blue-500" />;
    if (discussion?.isPremium) return <FaCrown className="text-yellow-500" />;
    if (discussion?.isElite) return <FaCoins className="text-purple-500" />;
    return null;
  };

  const getMessageStatus = () => {
    if (discussion?.lastMessageStatus === 'sent') return <FaPaperPlane className="text-gray-400" />;
    if (discussion?.lastMessageStatus === 'delivered') return <FaCheck className="text-gray-400" />;
    if (discussion?.lastMessageStatus === 'read') return <FaCheckDouble className="text-blue-500" />;
    return null;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, discussion);
      }}
      className={`
        relative group cursor-pointer p-4 rounded-lg transition-all duration-200
        ${isActive 
          ? `${theme.accentBg} text-white shadow-lg` 
          : `${theme.bgColor} hover:${theme.hoverBg} border-b ${theme.borderColor}`
        }
        ${discussion?.isPinned ? 'border-l-4 border-blue-500' : ''}
        ${discussion?.isArchived ? 'opacity-60' : ''}
        ${discussion?.isLocked ? 'border-l-4 border-red-500' : ''}
      `}
      onMouseEnter={() => setShowQuickActions(true)}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {/* Indicateurs d'état */}
      <div className="absolute top-2 left-2 flex gap-1">
        {discussion?.isPinned && (
          <FaThumbtack className="w-3 h-3 text-blue-500" />
        )}
        {discussion?.isLocked && (
          <FaLock className="w-3 h-3 text-red-500" />
        )}
        {discussion?.isMuted && (
          <IoMdNotificationsOff className="w-3 h-3 text-orange-500" />
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Avatar avec statut */}
        <div className="relative flex-shrink-0">
          <img
            src={discussion?.avatar}
            alt={discussion?.name}
            className={`
              w-12 h-12 rounded-full object-cover border-2
              ${discussion?.isOnline ? 'border-green-500' : 'border-transparent'}
              ${discussion?.isPremium ? 'ring-2 ring-yellow-400' : ''}
            `}
          />
          
          {/* Statut en ligne */}
          {discussion?.isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
          
          {/* Indicateur de message non lu */}
          {discussion?.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {discussion?.unreadCount > 9 ? '9+' : discussion?.unreadCount}
            </motion.div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <h4 className={`
                font-medium truncate
                ${isActive ? 'text-white' : theme.textColor}
                ${discussion?.unreadCount > 0 ? 'font-bold' : ''}
              `}>
                {discussion?.name}
              </h4>
              
              {/* Badges de statut */}
              {getStatusIcon()}
              
              {/* Indicateur de type */}
              {discussion?.type === 'group' && (
                <FaUsers className="w-3 h-3 text-blue-500" />
              )}
              {discussion?.type === 'broadcast' && (
                <FaBroadcastTower className="w-3 h-3 text-purple-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              {/* États de la discussion */}
              <DiscussionStates 
                discussion={discussion} 
                theme={theme} 
              />
              
              {/* Heure et statut du message */}
              <div className="flex items-center gap-1">
                {getMessageStatus()}
                <span className={`
                  text-xs whitespace-nowrap
                  ${isActive ? 'text-white/80' : theme.secondaryText}
                  ${discussion?.unreadCount > 0 ? 'font-semibold' : ''}
                `}>
                  {formatTime(discussion?.lastMessageTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Dernier message */}
          <div className="flex justify-between items-center">
            <p className={`
              text-sm truncate
              ${isActive ? 'text-white/90' : theme.secondaryText}
              ${discussion?.unreadCount > 0 ? 'font-medium' : ''}
            `}>
              {truncateMessage(discussion?.lastMessage)}
            </p>
            
            {/* Indicateurs supplémentaires */}
            <div className="flex items-center gap-1 ml-2">
              {discussion?.hasVoiceMessage && (
                <FaMicrophone className="w-3 h-3 text-blue-500" />
              )}
              {discussion?.hasMedia && (
                <FaCamera className="w-3 h-3 text-green-500" />
              )}
              {discussion?.hasLocation && (
                <FaMapMarkerAlt className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides (visible au hover) */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <CallButtons 
              discussion={discussion}
              isHovered={showQuickActions}
              showLabels={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Composant principal
const EliteDiscussionList = () => {
  const [filter, setFilter] = useState('all');
  const [isShowingFilters, setIsShowingFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuData, setContextMenuData] = useState({ discussion: null, position: { x: 0, y: 0 } });
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const { 
    realDiscussions, 
    discussions: mockDiscussions, 
    theme: t, 
    setActiveChat, 
    isMobile, 
    activeChat, 
    isAuthenticated 
  } = useApp();
  const { user } = useAuth();
  
  // Actions Elite
  const discussionActions = useDiscussionActions();
  const { showNotification, NotificationContainer } = useActionNotifications();
  
  // Utiliser les données réelles si disponibles, sinon les données mockées
  const discussions = realDiscussions.length > 0 ? realDiscussions : mockDiscussions;

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const toggleFilters = useCallback(() => {
    setIsShowingFilters(!isShowingFilters);
  }, [isShowingFilters]);

  const handleContextMenu = useCallback((e, discussion) => {
    e.preventDefault();
    setContextMenuData({
      discussion,
      position: { x: e.clientX, y: e.clientY }
    });
    setShowContextMenu(true);
  }, []);

  const handleContextAction = useCallback((action, discussion) => {
    console.log(`Action ${action} sur la discussion:`, discussion?.name);
    setShowContextMenu(false);
    
    // Implémenter les actions fonctionnelles
    try {
      switch (action) {
        case 'pin':
          discussionActions.togglePin(discussion.id);
          showNotification(
            discussionActions.isPinned(discussion.id) ? 'unpin' : 'pin',
            discussion.name
          );
          break;
          
        case 'favorite':
          discussionActions.toggleFavorite(discussion.id);
          showNotification(
            discussionActions.isFavorite(discussion.id) ? 'unfavorite' : 'favorite',
            discussion.name
          );
          break;
          
        case 'archive':
          discussionActions.toggleArchive(discussion.id);
          showNotification(
            discussionActions.isArchived(discussion.id) ? 'unarchive' : 'archive',
            discussion.name
          );
          break;
          
        case 'lock':
          discussionActions.toggleLock(discussion.id);
          showNotification(
            discussionActions.isLocked(discussion.id) ? 'unlock' : 'lock',
            discussion.name
          );
          break;
          
        case 'mute':
          discussionActions.toggleMute(discussion.id);
          showNotification(
            discussionActions.isMuted(discussion.id) ? 'unmute' : 'mute',
            discussion.name
          );
          break;
          
        case 'mark-read':
          discussionActions.markAsRead(discussion.id);
          showNotification('mark-read', discussion.name);
          break;
          
        case 'forward':
          // TODO: Implémenter le transfert
          showNotification('forward', discussion.name, 'info');
          break;
          
        case 'export':
          // TODO: Implémenter l'export
          showNotification('export', discussion.name, 'info');
          break;
          
        case 'block':
          discussionActions.blockUser(discussion.id);
          showNotification('block', discussion.name, 'warning');
          break;
          
        case 'report':
          // TODO: Implémenter le signalement
          showNotification('report', discussion.name, 'warning');
          break;
          
        case 'delete':
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer la discussion avec "${discussion.name}" ?`)) {
            discussionActions.deleteDiscussion(discussion.id);
            showNotification('delete', discussion.name, 'error');
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      showNotification(action, discussion.name, 'error');
    }
  }, [discussionActions, showNotification]);

  // Créer une nouvelle discussion avec un utilisateur
  const createDiscussion = useCallback(async (targetUserId) => {
    if (!user?.id || !targetUserId) {
      console.log('❌ IDs manquants pour créer discussion:', { userId: user?.id, targetUserId });
      return;
    }

    try {
      console.log('🔨 Création discussion entre:', user.id, 'et', targetUserId);
      const { data, error } = await db.createDiscussion([user.id, targetUserId]);
      
      if (error) {
        console.error('❌ Erreur création discussion:', error);
        alert(`Erreur lors de la création de la discussion: ${error.message || error}`);
      } else {
        console.log('✅ Discussion créée avec succès:', data);
        setShowCreateModal(false);
        alert('Discussion créée avec succès !');
        
        // Forcer le rechargement de la page pour voir la nouvelle discussion
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la discussion:', error);
      alert(`Erreur lors de la création de la discussion: ${error.message || error}`);
    }
  }, [user?.id]);

  // Charger la liste des utilisateurs disponibles
  const loadAvailableUsers = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingUsers(true);
    try {
      console.log('👥 Chargement des utilisateurs pour créer une discussion...');
      const { data, error } = await db.getUsers(user.id);

      if (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
      } else {
        console.log(`✅ ${data?.length || 0} utilisateurs trouvés:`, data);
        setAvailableUsers(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [user?.id]);

  // Ouvrir le modal de création
  const handleCreateDiscussion = useCallback(() => {
    setShowCreateModal(true);
    loadAvailableUsers();
  }, [loadAvailableUsers]);

  const handleQuickAction = useCallback((action, discussion) => {
    console.log(`Action rapide ${action} sur:`, discussion?.name);
    
    switch (action) {
      case 'call':
        // Démarrer un appel vocal
        break;
      case 'video':
        // Démarrer un appel vidéo
        break;
      case 'message':
        // Ouvrir la discussion
        setActiveChat(discussion);
        break;
      default:
        break;
    }
  }, [setActiveChat]);

  // Enrichir les discussions avec les états du store
  const enrichedDiscussions = useMemo(() => {
    return discussions.map(discussion => ({
      ...discussion,
      isPinned: discussionActions.isPinned(discussion.id),
      isArchived: discussionActions.isArchived(discussion.id),
      isFavorite: discussionActions.isFavorite(discussion.id),
      isLocked: discussionActions.isLocked(discussion.id),
      isMuted: discussionActions.isMuted(discussion.id),
      isBlocked: discussionActions.isBlocked(discussion.id),
    }));
  }, [discussions, discussionActions]);

  const filteredDiscussions = useMemo(() => {
    return enrichedDiscussions
      .filter((d) => {
        // Ne pas afficher les discussions bloquées dans la liste principale
        if (d.isBlocked && filter !== 'blocked') return false;
        
        if (filter === 'unread') return d.unread;
        if (filter === 'online') return d.isOnline;
        if (filter === 'pinned') return d.isPinned;
        if (filter === 'archived') return d.isArchived;
        if (filter === 'favorites') return d.isFavorite;
        if (filter === 'locked') return d.isLocked;
        return true;
      })
      .filter((d) => {
        const q = searchQuery.toLowerCase();
        return !q || d.name.toLowerCase().includes(q) || (d.lastMessage?.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        // Trier : épinglées en premier, puis par date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
  }, [enrichedDiscussions, filter, searchQuery]);

  return (
    <div className={`${t.w} ${t.bgColor} h-screen flex flex-col`}>
      {/* Header Elite */}
      <div className={`px-4 py-3 border-b ${t.borderColor} ${t.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`text-xl font-bold ${t.textColor}`}>
              Discussions
            </h1>
                    {realDiscussions.length === 0 && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Mode Demo
            </span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              {user?.id ? `User ID: ${user.id.slice(0, 8)}...` : 'Non connecté'}
            </span>
          </div>
        )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bouton de recherche */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearching(!isSearching)}
              className={`p-2 rounded-full ${t.hoverBg} ${t.textColor}`}
            >
              <FaSearch className="w-4 h-4" />
            </motion.button>
            
            {/* Bouton Elite-Coins */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWallet(true)}
              className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
              title="Elite Wallet"
            >
              <FaCoins className="w-3 h-3" />
            </motion.button>
            
            {/* Bouton de création */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateDiscussion}
              className={`p-2 rounded-full ${t.accentBg} text-white`}
              title="Nouvelle discussion"
            >
              <FaPlus className="w-3 h-3" />
            </motion.button>
            
            {/* Bouton de filtre */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}  
              className={`p-2 rounded-full ${t.hoverBg} ${t.textColor}`}
            >
            {!isShowingFilters ? (
              <FaFilter className="w-4 h-4" onClick={toggleFilters} />
            ) : (
              <FaTimes className="w-4 h-4" onClick={toggleFilters} />)
              }
            </motion.button>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.secondaryText} w-4 h-4`} />
                <input
                  type="text"
                  placeholder="Rechercher dans les discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 rounded-full ${t.inputBg} ${t.textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.secondaryText}`}
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message d'information et debug */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <p className={`text-sm ${t.textColor}`}>
              {realDiscussions.length === 0 
                ? 'Mode démonstration Elite - Aucune discussion trouvée'
                : `${realDiscussions.length} discussion(s) chargée(s)`
              }
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            Debug: User ID: {user?.id || 'Non connecté'} | 
            Discussions réelles: {realDiscussions.length} | 
            Discussions mock: {mockDiscussions.length}
          </div>
        </div>
      </motion.div>

      {/* Filtres avancés */}
      <FilterSection 
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        theme={t}
        discussions={enrichedDiscussions}
        isShowingFilters={isShowingFilters}
        toggleFilters={toggleFilters}
      />

      {/* Liste des discussions */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'mb-[12vh]' : 'mb-[1vh]'} ml-1 ${t.scrollbar}`}>
        <AnimatePresence mode="popLayout">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion?.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: 20 }
                }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <EliteDiscussionItem
                  discussion={discussion}
                  onClick={() => setActiveChat(discussion)}
                  theme={t}
                  isActive={activeChat?.id === discussion?.id}
                  onContextMenu={handleContextMenu}
                  onQuickAction={handleQuickAction}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center h-full italic ${t.emptyStateText} p-4`}
            >
              {searchQuery ? (
                <>
                  <div className={`text-lg mb-2 ${t.textColor}`}>
                    Aucun résultat pour "{searchQuery}"
                  </div>
                  <div className={`text-sm ${t.secondaryText}`}>
                    Essayez un autre terme de recherche
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-lg mb-2 ${t.textColor}`}>
                    Aucune discussion {filter !== 'all' ? `dans ${filter}` : ''}
                  </div>
                  <div className={`text-sm ${t.secondaryText}`}>
                    Commencez une nouvelle conversation
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu contextuel */}
      <DiscussionContextMenu
        discussion={contextMenuData.discussion}
        isVisible={showContextMenu}
        position={contextMenuData.position}
        onClose={() => setShowContextMenu(false)}
        onAction={handleContextAction}
        theme={t}
      />
      
      {/* Notifications d'actions */}
      <NotificationContainer theme={t} />
      
      {/* Modal de création simplifié */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`${t.bgColor} rounded-lg w-full max-w-md mx-4 p-6 shadow-xl border ${t.borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${t.textColor}`}>Nouvelle discussion</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-full ${t.hoverBg}`}
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            <p className={`text-sm ${t.secondaryText} mb-4`}>
              Sélectionnez un utilisateur pour commencer une discussion
            </p>
            
            <div className="max-h-64 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className={`ml-2 ${t.textColor}`}>Chargement...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`${t.secondaryText}`}>Aucun utilisateur disponible</p>
                  <p className={`text-xs ${t.secondaryText} mt-2`}>
                    Invitez des amis à rejoindre Elite Chat !
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((targetUser) => (
                    <motion.button
                      key={targetUser.id}
                      onClick={() => createDiscussion(targetUser.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg ${t.hoverBg} hover:scale-[1.02] transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <img
                          src={targetUser.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                          alt={targetUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {targetUser.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${t.textColor}`}>
                          {targetUser.name}
                        </div>
                        <div className={`text-sm ${t.secondaryText}`}>
                          @{targetUser.username} • {targetUser.is_online ? 'En ligne' : 'Hors ligne'}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Elite Wallet */}
      <EliteWallet
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </div>
  );
};

export default EliteDiscussionList;
