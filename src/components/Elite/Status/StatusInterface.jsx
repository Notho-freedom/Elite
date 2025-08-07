import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCamera, FaVideo, FaMicrophone, FaMapMarkerAlt, FaPollH, FaCrown, FaEye, FaCoins, FaChartLine, FaCog, FaTimes, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
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

  const activeStatuses = getActiveStatuses();

  // Archivage automatique
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.autoArchive) {
        // Appeler l'action d'archivage
        useStatusStore.getState().archiveExpiredStatuses();
      }
    }, 60000); // Vérifier toutes les minutes

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
    // Le statut est automatiquement ajouté au store
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case STATUS_TYPES.TEXT: return null;
      case STATUS_TYPES.IMAGE: return <FaCamera className="w-4 h-4" />;
      case STATUS_TYPES.VIDEO: return <FaVideo className="w-4 h-4" />;
      case STATUS_TYPES.AUDIO: return <FaMicrophone className="w-4 h-4" />;
      case STATUS_TYPES.LOCATION: return <FaMapMarkerAlt className="w-4 h-4" />;
      case STATUS_TYPES.POLL: return <FaPollH className="w-4 h-4" />;
      case STATUS_TYPES.ELITE: return <FaCrown className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusPreview = (status) => {
    switch (status.type) {
      case STATUS_TYPES.TEXT:
        return status.content.length > 50 ? `${status.content.substring(0, 50)}...` : status.content;
      case STATUS_TYPES.IMAGE:
        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
            <img src={status.content} alt="Preview" className="w-full h-full object-cover" />
          </div>
        );
      case STATUS_TYPES.VIDEO:
        return (
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
            <FaPlay className="w-4 h-4 text-gray-600" />
          </div>
        );
      case STATUS_TYPES.AUDIO:
        return (
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
            <FaVolumeUp className="w-4 h-4 text-gray-600" />
          </div>
        );
      default:
        return <div className="w-12 h-12 rounded-lg bg-gray-200" />;
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
    { id: 'my-statuses', label: 'Mes Statuts', count: activeStatuses.length },
    { id: 'contacts', label: 'Contacts', count: 0 },
    { id: 'discover', label: 'Découvrir', count: 0 }
  ];

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Statuts</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaEye className="w-4 h-4" />
            <span>{stats.totalViews} vues</span>
            <FaCoins className="w-4 h-4 text-yellow-500" />
            <span>{stats.totalEarnings} Elite-Coins</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(true)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            title="Statistiques"
          >
            <FaChartLine className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            title="Paramètres"
          >
            <FaCog className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleCreateStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-center relative ${
              activeTab === tab.id
                ? 'text-blue-500'
                : theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px]">
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'my-statuses' && (
          <div className="p-4">
            {activeStatuses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun statut actif</h3>
                <p className="text-gray-500 mb-4">Créez votre premier statut pour commencer à partager</p>
                <button
                  onClick={handleCreateStatus}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Créer un statut
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeStatuses.map((status) => (
                  <motion.div
                    key={status.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => handleViewStatus(status)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      theme === 'dark' 
                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getStatusPreview(status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(status.type)}
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(status.createdAt)}
                          </span>
                          {status.monetization?.enabled && (
                            <FaCoins className="w-4 h-4 text-yellow-500" title="Statut monétisé" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {status.type === STATUS_TYPES.TEXT && (
                              <p className="text-sm line-clamp-2">{status.content}</p>
                            )}
                            {status.type !== STATUS_TYPES.TEXT && (
                              <p className="text-sm text-gray-500">
                                {status.type === STATUS_TYPES.IMAGE && 'Image'}
                                {status.type === STATUS_TYPES.VIDEO && 'Vidéo'}
                                {status.type === STATUS_TYPES.AUDIO && 'Audio'}
                                {status.type === STATUS_TYPES.LOCATION && 'Localisation'}
                                {status.type === STATUS_TYPES.POLL && 'Sondage'}
                                {status.type === STATUS_TYPES.ELITE && 'Statut Elite'}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaEye className="w-3 h-3" />
                              {status.views.length}
                            </span>
                            {status.monetization?.enabled && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                <FaCoins className="w-3 h-3" />
                                {status.earnings}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="p-4 text-center py-12">
            <p className="text-gray-500">Statuts des contacts à venir</p>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="p-4 text-center py-12">
            <p className="text-gray-500">Découverte de statuts à venir</p>
          </div>
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
