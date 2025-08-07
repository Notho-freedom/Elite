import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 FaPhone, FaVideo, FaClock, FaFilter,
  FaTrash, FaDownload, FaShare, FaStar,
  FaUser, FaUsers, FaArrowUp, FaArrowDown
} from 'react-icons/fa6';
import {  FaTimes, FaSearch,FaRedo} from 'react-icons/fa';
import { useCallStore, CALL_TYPES, CALL_STATES } from '../../../lib/callStore';

const CallHistory = ({ onClose }) => {
  const { callHistory, deleteCallFromHistory, clearCallHistory } = useCallStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filterOptions = [
    { id: 'all', label: 'Tous les appels', icon: FaPhone },
    { id: 'voice', label: 'Appels vocaux', icon: FaPhone },
    { id: 'video', label: 'Appels vidéo', icon: FaVideo },
    { id: 'missed', label: 'Appels manqués', icon: FaClock },
    { id: 'outgoing', label: 'Appels sortants', icon: FaArrowUp },
    { id: 'incoming', label: 'Appels entrants', icon: FaArrowDown }
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'duration', label: 'Durée' },
    { id: 'name', label: 'Nom' },
    { id: 'type', label: 'Type' }
  ];

  // Filtrer et trier les appels
  const filteredAndSortedCalls = callHistory
    .filter(call => {
      const matchesSearch = call.participants.some(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesFilter = filterType === 'all' || 
        (filterType === 'voice' && (call.type === CALL_TYPES.VOICE || call.type === CALL_TYPES.GROUP_VOICE)) ||
        (filterType === 'video' && (call.type === CALL_TYPES.VIDEO || call.type === CALL_TYPES.GROUP_VIDEO)) ||
        (filterType === 'missed' && call.state === CALL_STATES.MISSED) ||
        (filterType === 'outgoing' && call.isOutgoing) ||
        (filterType === 'incoming' && !call.isOutgoing);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.startTime) - new Date(a.startTime);
          break;
        case 'duration':
          comparison = (b.duration || 0) - (a.duration || 0);
          break;
        case 'name':
          const nameA = a.participants[0]?.name || '';
          const nameB = b.participants[0]?.name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const callDate = new Date(date);
    const diffInHours = (now - callDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return callDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return callDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getCallIcon = (call) => {
    const isVideo = call.type === CALL_TYPES.VIDEO || call.type === CALL_TYPES.GROUP_VIDEO;
    const isGroup = call.type === CALL_TYPES.GROUP_VOICE || call.type === CALL_TYPES.GROUP_VIDEO;
    
    if (isGroup) return FaUsers;
    return isVideo ? FaVideo : FaPhone;
  };

  const getCallStatusColor = (call) => {
    switch (call.state) {
      case CALL_STATES.ENDED:
        return 'text-green-400';
      case CALL_STATES.MISSED:
        return 'text-red-400';
      case CALL_STATES.REJECTED:
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleDeleteCall = (callId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet appel de l\'historique ?')) {
      deleteCallFromHistory(callId);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des appels ?')) {
      clearCallHistory();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FaClock className="text-blue-500 text-xl" />
              <h2 className="text-xl font-bold text-white">Historique des appels</h2>
              <span className="text-gray-400 text-sm">({callHistory.length} appels)</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === 'desc' ? <FaArrowDown className="text-gray-400" /> : <FaArrowUp className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto">
              {filterOptions.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    filterType === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <filter.icon />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Call List */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {filteredAndSortedCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaClock className="text-4xl mb-4" />
                <p className="text-lg font-medium">Aucun appel trouvé</p>
                <p className="text-sm">Aucun appel ne correspond à vos critères de recherche</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredAndSortedCalls.map(call => {
                  const CallIcon = getCallIcon(call);
                  const mainParticipant = call.participants.find(p => !p.isMe) || call.participants[0];
                  
                  return (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Call Icon */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            call.type.includes('video') ? 'bg-blue-600' : 'bg-green-600'
                          }`}>
                            <CallIcon className="text-white" />
                          </div>

                          {/* Call Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-medium">
                                {mainParticipant?.name || 'Contact inconnu'}
                              </h3>
                              {call.isGroup && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                  Groupe
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className={getCallStatusColor(call)}>
                                {call.state === CALL_STATES.ENDED ? 'Terminé' :
                                 call.state === CALL_STATES.MISSED ? 'Manqué' :
                                 call.state === CALL_STATES.REJECTED ? 'Rejeté' : 'Inconnu'}
                              </span>
                              <span>{formatDuration(call.duration)}</span>
                              <span>{formatDate(call.startTime)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => console.log('Redémarrer appel', call.id)}
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            title="Redémarrer l'appel"
                          >
                            <FaRedo className="text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => console.log('Télécharger', call.id)}
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            title="Télécharger l'enregistrement"
                          >
                            <FaDownload className="text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => console.log('Partager', call.id)}
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            title="Partager"
                          >
                            <FaShare className="text-gray-400" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCall(call.id)}
                            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash className="text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Effacer l'historique
            </button>
            
            <div className="text-gray-400 text-sm">
              {filteredAndSortedCalls.length} sur {callHistory.length} appels affichés
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallHistory;
