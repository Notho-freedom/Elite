import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUsers, FaEye, FaCheck, FaTimes as FaX, FaSearch, FaFilter, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import { useGroupStore, REQUEST_STATES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const GroupJoinRequests = ({ onClose }) => {
  const { theme } = useApp();
  const { joinRequests, approveJoinRequest, rejectJoinRequest } = useGroupStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');

  const filters = [
    { id: 'all', label: 'Toutes', count: joinRequests.length },
    { id: 'pending', label: 'En attente', count: joinRequests.filter(r => r.state === REQUEST_STATES.PENDING).length },
    { id: 'approved', label: 'Approuvées', count: joinRequests.filter(r => r.state === REQUEST_STATES.APPROVED).length },
    { id: 'rejected', label: 'Rejetées', count: joinRequests.filter(r => r.state === REQUEST_STATES.REJECTED).length }
  ];

  const getStatusIcon = (state) => {
    const iconClass = "w-4 h-4";
    switch (state) {
      case REQUEST_STATES.PENDING: return <FaClock className={`${iconClass} text-yellow-500`} />;
      case REQUEST_STATES.APPROVED: return <FaCheckCircle className={`${iconClass} text-green-500`} />;
      case REQUEST_STATES.REJECTED: return <FaTimesCircle className={`${iconClass} text-red-500`} />;
      case REQUEST_STATES.CANCELLED: return <FaBan className={`${iconClass} text-gray-500`} />;
      default: return <FaClock className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getStatusLabel = (state) => {
    switch (state) {
      case REQUEST_STATES.PENDING: return 'En attente';
      case REQUEST_STATES.APPROVED: return 'Approuvée';
      case REQUEST_STATES.REJECTED: return 'Rejetée';
      case REQUEST_STATES.CANCELLED: return 'Annulée';
      default: return 'En attente';
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case REQUEST_STATES.PENDING: return 'text-yellow-500';
      case REQUEST_STATES.APPROVED: return 'text-green-500';
      case REQUEST_STATES.REJECTED: return 'text-red-500';
      case REQUEST_STATES.CANCELLED: return 'text-gray-500';
      default: return 'text-yellow-500';
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

  const filteredRequests = joinRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || request.state === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (requestId) => {
    approveJoinRequest(requestId);
  };

  const handleReject = (requestId) => {
    rejectJoinRequest(requestId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.textColor}`}>Demandes d'adhésion</h2>
              <p className={`text-sm ${theme.secondaryText}`}>
                {joinRequests.filter(r => r.state === REQUEST_STATES.PENDING).length} demande{joinRequests.filter(r => r.state === REQUEST_STATES.PENDING).length > 1 ? 's' : ''} en attente
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-3 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className={`relative z-10 p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.secondaryText}`} />
              <input
                type="text"
                placeholder="Rechercher des demandes..."
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

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
        </div>

        {/* Requests List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                <FaEye className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Aucune demande trouvée</h3>
              <p className={`${theme.secondaryText}`}>
                {searchQuery ? 'Aucune demande ne correspond à votre recherche' : 'Aucune demande d\'adhésion pour le moment'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-xl transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50' 
                      : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img 
                        src={request.userAvatar} 
                        alt={request.userName}
                        className="w-12 h-12 rounded-full object-cover shadow-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-medium ${theme.textColor}`}>{request.userName}</h4>
                          <span className={`flex items-center gap-1 text-sm ${getStatusColor(request.state)}`}>
                            {getStatusIcon(request.state)}
                            <span>{getStatusLabel(request.state)}</span>
                          </span>
                        </div>
                        
                        <p className={`text-sm ${theme.secondaryText} mb-2`}>
                          Demande d'adhésion au groupe <span className={`font-medium ${theme.textColor}`}>{request.groupName}</span>
                        </p>
                        
                        {request.message && (
                          <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 mb-3`}>
                            <p className={`text-sm ${theme.textColor}`}>{request.message}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className={`${theme.secondaryText}`}>
                            {formatTimeAgo(request.createdAt)}
                          </span>
                          <span className={`${theme.secondaryText}`}>
                            ID: {request.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {request.state === REQUEST_STATES.PENDING && (
                      <div className="flex items-center gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(request.id)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg`}
                        >
                          <FaCheck className="w-4 h-4" />
                          Approuver
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(request.id)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg`}
                        >
                          <FaX className="w-4 h-4" />
                          Rejeter
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-4 text-sm">
            <span className={`${theme.secondaryText}`}>
              {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} affichée{filteredRequests.length > 1 ? 's' : ''}
            </span>
            <span className={`${theme.secondaryText}`}>
              {joinRequests.filter(r => r.state === REQUEST_STATES.PENDING).length} en attente
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
          >
            Fermer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupJoinRequests;
