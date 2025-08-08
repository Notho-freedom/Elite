import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCamera, FaVideo, FaMicrophone, FaMapMarkerAlt, FaPollH, FaCrown, FaEye, FaCoins, FaChartLine, FaCog, FaTimes, FaPlay, FaVolumeUp, FaStar, FaFire, FaGem } from 'react-icons/fa';
import { FaDiamond } from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi2';
import { useStatusStore, useStatusActions, STATUS_TYPES, MONETIZATION_TYPES } from '../../../lib/statusStore';
import { useApp } from '../../Context/AppContext';
import StatusCreator from './StatusCreator';
import StatusViewer from './StatusViewer';
import StatusStats from './StatusStats';
import StatusSettings from './StatusSettings';

const StatusInterface = () => {
  const { theme } = useApp();
  const { myStatuses, stats, settings } = useStatusStore();
  const { getActiveStatuses } = useStatusActions();
  
  const [activeTab, setActiveTab] = useState('my-statuses');
  const [showCreator, setShowCreator] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [viewingStatus, setViewingStatus] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const activeStatuses = getActiveStatuses();

  // Archivage automatique
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.autoArchive) {
        useStatusStore.getState().archiveExpiredStatuses();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [settings.autoArchive]);

  const handleCreateStatus = () => {
    setShowCreator(true);
  };

  const handleViewStatus = (status) => {
    setViewingStatus(status);
    setShowViewer(true);
  };

  const handleStatusCreated = (newStatus) => {
    setShowCreator(false);
  };

  const getStatusIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case STATUS_TYPES.TEXT: return <HiSparkles className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.IMAGE: return <FaCamera className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.VIDEO: return <FaVideo className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.AUDIO: return <FaMicrophone className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.LOCATION: return <FaMapMarkerAlt className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.POLL: return <FaPollH className={`${iconClass} ${theme.goldText}`} />;
      case STATUS_TYPES.ELITE: return <FaCrown className={`${iconClass} text-yellow-500`} />;
      default: return null;
    }
  };

  const getStatusPreview = (status) => {
    const previewClass = "w-16 h-16 rounded-xl overflow-hidden shadow-lg";
    const iconClass = "w-6 h-6";
    
    switch (status.type) {
      case STATUS_TYPES.TEXT:
        return (
          <div className={`${previewClass} ${theme.accentBg} flex items-center justify-center`}>
            <HiSparkles className={`${iconClass} text-white`} />
          </div>
        );
      case STATUS_TYPES.IMAGE:
        return (
          <div className={`${previewClass} relative group`}>
            <img src={status.content} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      case STATUS_TYPES.VIDEO:
        return (
          <div className={`${previewClass} ${theme.accentBg} flex items-center justify-center relative group`}>
            <FaPlay className={`${iconClass} text-white`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      case STATUS_TYPES.AUDIO:
        return (
          <div className={`${previewClass} ${theme.accentBg} flex items-center justify-center`}>
            <FaVolumeUp className={`${iconClass} text-white`} />
          </div>
        );
      case STATUS_TYPES.ELITE:
        return (
          <div className={`${previewClass} bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center relative`}>
            <FaCrown className={`${iconClass} text-white`} />
            <div className="absolute top-1 right-1">
              <FaGem className="w-3 h-3 text-white" />
            </div>
          </div>
        );
      default:
        return (
          <div className={`${previewClass} ${theme.accentBg} flex items-center justify-center`}>
            <FaStar className={`${iconClass} text-white`} />
          </div>
        );
    }
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
    { id: 'my-statuses', label: 'Mes Statuts', count: activeStatuses.length, icon: <HiSparkles /> },
    { id: 'contacts', label: 'Contacts', count: 0, icon: <FaStar /> },
    { id: 'discover', label: 'Découvrir', count: 0, icon: <FaFire /> }
  ];

  return (
    <div className={`h-full flex flex-col ${theme.bgColor} ${theme.textColor} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaCrown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme.textColor}`}>Statuts Elite</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                  <FaEye className="w-4 h-4" />
                  <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
                  <span>vues</span>
                </span>
                <span className={`flex items-center gap-2 ${theme.goldText}`}>
                  <FaCoins className="w-4 h-4" />
                  <span className="font-medium">{stats.totalEarnings}</span>
                  <span>Elite-Coins</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(true)}
            className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
            title="Statistiques"
          >
            <FaChartLine className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
            title="Paramètres"
          >
            <FaCog className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateStatus}
            className={`${theme.buttonGold} p-3 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200 ${theme.accentShadow}`}
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Nouveau Statut</span>
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
        {activeTab === 'my-statuses' && (
          <div className="p-6">
            {activeStatuses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center shadow-2xl`}>
                  <FaPlus className="w-12 h-12 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${theme.textColor}`}>Aucun statut actif</h3>
                <p className={`text-lg mb-8 ${theme.secondaryText}`}>Créez votre premier statut Elite pour commencer à partager</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateStatus}
                  className={`${theme.buttonGold} px-8 py-4 rounded-xl text-lg font-medium shadow-xl transition-all duration-200 ${theme.accentShadow}`}
                >
                  <HiSparkles className="w-5 h-5 inline mr-3" />
                  Créer un statut Elite
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid gap-6 max-w-4xl mx-auto">
                {activeStatuses.map((status, index) => (
                  <motion.div
                    key={status.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ delay: index * 0.1 }}
                    onHoverStart={() => setHoveredStatus(status.id)}
                    onHoverEnd={() => setHoveredStatus(null)}
                    onClick={() => handleViewStatus(status)}
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                      hoveredStatus === status.id ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'
                    } ${
                      theme === 'dark' 
                        ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50 backdrop-blur-sm' 
                        : 'bg-white/80 hover:bg-white/90 border border-gray-200/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getStatusPreview(status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(status.type)}
                          <span className={`text-sm font-medium ${theme.secondaryText}`}>
                            {formatTimeAgo(status.createdAt)}
                          </span>
                          {status.monetization?.enabled && (
                            <div className="flex items-center gap-1">
                              <FaCoins className="w-4 h-4 text-yellow-500" title="Statut monétisé" />
                              <FaDiamond className="w-3 h-3 text-blue-500" title="Premium" />
                            </div>
                          )}
                          {status.type === STATUS_TYPES.ELITE && (
                            <div className="flex items-center gap-1">
                              <FaCrown className="w-4 h-4 text-yellow-500" />
                              <FaGem className="w-3 h-3 text-purple-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {status.type === STATUS_TYPES.TEXT && (
                              <p className={`text-base leading-relaxed ${theme.textColor}`}>{status.content}</p>
                            )}
                            {status.type !== STATUS_TYPES.TEXT && (
                              <p className={`text-base font-medium ${theme.textColor}`}>
                                {status.type === STATUS_TYPES.IMAGE && '📸 Image'}
                                {status.type === STATUS_TYPES.VIDEO && '🎥 Vidéo'}
                                {status.type === STATUS_TYPES.AUDIO && '🎤 Audio'}
                                {status.type === STATUS_TYPES.LOCATION && '📍 Localisation'}
                                {status.type === STATUS_TYPES.POLL && '📊 Sondage'}
                                {status.type === STATUS_TYPES.ELITE && '👑 Statut Elite'}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`flex items-center gap-2 ${theme.secondaryText}`}>
                              <FaEye className="w-4 h-4" />
                              <span className="font-medium">{status.views.length}</span>
                            </span>
                            {status.monetization?.enabled && (
                              <span className={`flex items-center gap-2 ${theme.goldText} font-medium`}>
                                <FaCoins className="w-4 h-4" />
                                <span>{status.earnings}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Effects */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredStatus === status.id ? 1 : 0 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 pointer-events-none"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center py-16"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center`}>
              <FaStar className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Statuts des contacts</h3>
            <p className={`${theme.secondaryText}`}>Découvrez les statuts de vos contacts</p>
          </motion.div>
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
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Découvrir</h3>
            <p className={`${theme.secondaryText}`}>Explorez les statuts populaires</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreator && (
          <StatusCreator
            onClose={() => setShowCreator(false)}
            onCreated={handleStatusCreated}
          />
        )}
        
        {showViewer && viewingStatus && (
          <StatusViewer
            status={viewingStatus}
            onClose={() => {
              setShowViewer(false);
              setViewingStatus(null);
            }}
          />
        )}
        
        {showStats && (
          <StatusStats
            onClose={() => setShowStats(false)}
          />
        )}
        
        {showSettings && (
          <StatusSettings
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusInterface;
