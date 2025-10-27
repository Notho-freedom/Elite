import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUsers, FaCrown, FaUserShield, FaUser, FaUserFriends, FaEye, FaCheck, FaTimes as FaX, FaSearch, FaFilter, FaEllipsisV, FaVolumeMute, FaVolumeUp, FaBan, FaTrash, FaEdit } from 'react-icons/fa';
import { useGroupStore, PARTICIPANT_ROLES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const GroupParticipants = ({ group, onClose }) => {
  const { theme } = useApp();
  const { participants, updateParticipantRole, removeParticipant } = useGroupStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const groupParticipants = participants[group.id] || [];

  const filters = [
    { id: 'all', label: 'Tous', count: groupParticipants.length },
    { id: 'online', label: 'En ligne', count: groupParticipants.filter(p => p.isOnline).length },
    { id: 'admins', label: 'Admins', count: groupParticipants.filter(p => p.role === PARTICIPANT_ROLES.ADMIN || p.role === PARTICIPANT_ROLES.OWNER).length },
    { id: 'members', label: 'Membres', count: groupParticipants.filter(p => p.role === PARTICIPANT_ROLES.MEMBER).length }
  ];

  const getRoleIcon = (role) => {
    const iconClass = "w-4 h-4";
    switch (role) {
      case PARTICIPANT_ROLES.OWNER: return <FaCrown className={`${iconClass} text-yellow-500`} />;
      case PARTICIPANT_ROLES.ADMIN: return <FaUserShield className={`${iconClass} text-blue-500`} />;
      case PARTICIPANT_ROLES.MODERATOR: return <FaUserShield className={`${iconClass} text-green-500`} />;
      case PARTICIPANT_ROLES.MEMBER: return <FaUser className={`${iconClass} text-gray-500`} />;
      case PARTICIPANT_ROLES.GUEST: return <FaUserFriends className={`${iconClass} text-orange-500`} />;
      default: return <FaUser className={`${iconClass} text-gray-500`} />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case PARTICIPANT_ROLES.OWNER: return 'Propriétaire';
      case PARTICIPANT_ROLES.ADMIN: return 'Administrateur';
      case PARTICIPANT_ROLES.MODERATOR: return 'Modérateur';
      case PARTICIPANT_ROLES.MEMBER: return 'Membre';
      case PARTICIPANT_ROLES.GUEST: return 'Invité';
      default: return 'Membre';
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

  const filteredParticipants = groupParticipants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'online' && participant.isOnline) ||
      (selectedFilter === 'admins' && (participant.role === PARTICIPANT_ROLES.ADMIN || participant.role === PARTICIPANT_ROLES.OWNER)) ||
      (selectedFilter === 'members' && participant.role === PARTICIPANT_ROLES.MEMBER);
    
    return matchesSearch && matchesFilter;
  });

  const handleRoleChange = (participantId, newRole) => {
    updateParticipantRole(group.id, participantId, newRole);
  };

  const handleRemoveParticipant = (participantId) => {
    removeParticipant(group.id, participantId);
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
              <FaUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.textColor}`}>Participants</h2>
              <p className={`text-sm ${theme.secondaryText}`}>{group.name} • {groupParticipants.length} membres</p>
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
                placeholder="Rechercher des participants..."
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

        {/* Participants List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          {filteredParticipants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                <FaUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${theme.textColor}`}>Aucun participant trouvé</h3>
              <p className={`${theme.secondaryText}`}>
                {searchQuery ? 'Aucun participant ne correspond à votre recherche' : 'Aucun participant dans ce groupe'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredParticipants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50' 
                      : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={participant.avatar} 
                          alt={participant.name}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                        />
                        {participant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${theme.textColor}`}>{participant.name}</h4>
                          {participant.isVerified && (
                            <FaCheck className="w-4 h-4 text-blue-500" title="Vérifié" />
                          )}
                          {participant.isElite && (
                            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">E</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`flex items-center gap-1 ${theme.secondaryText}`}>
                            {getRoleIcon(participant.role)}
                            <span>{getRoleLabel(participant.role)}</span>
                          </span>
                          <span className={`${theme.secondaryText}`}>
                            {formatTimeAgo(participant.lastSeen)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className={`font-medium ${theme.textColor}`}>{participant.messageCount}</div>
                        <div className={`${theme.secondaryText}`}>messages</div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedParticipant(participant)}
                          className={`p-2 rounded-lg transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                        >
                          <FaEllipsisV className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
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
              {filteredParticipants.length} participant{filteredParticipants.length > 1 ? 's' : ''} affiché{filteredParticipants.length > 1 ? 's' : ''}
            </span>
            <span className={`${theme.secondaryText}`}>
              {groupParticipants.filter(p => p.isOnline).length} en ligne
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

        {/* Participant Actions Modal */}
        {selectedParticipant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedParticipant(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl shadow-2xl ${theme.bgColor} ${theme.textColor}`}
            >
              <div className={`p-6 border-b ${theme.borderColor}`}>
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedParticipant.avatar} 
                    alt={selectedParticipant.name}
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                  <div>
                    <h3 className={`text-lg font-semibold ${theme.textColor}`}>{selectedParticipant.name}</h3>
                    <p className={`text-sm ${theme.secondaryText}`}>{getRoleLabel(selectedParticipant.role)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>Rôle</label>
                  <select
                    value={selectedParticipant.role}
                    onChange={(e) => {
                      handleRoleChange(selectedParticipant.id, e.target.value);
                      setSelectedParticipant(null);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                  >
                    <option value={PARTICIPANT_ROLES.MEMBER}>Membre</option>
                    <option value={PARTICIPANT_ROLES.MODERATOR}>Modérateur</option>
                    <option value={PARTICIPANT_ROLES.ADMIN}>Administrateur</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <div>
                    <h5 className={`font-medium ${theme.textColor}`}>Mettre en sourdine</h5>
                    <p className={`text-sm ${theme.secondaryText}`}>Désactiver les notifications pour ce membre</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300`}
                  >
                    <motion.span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                    />
                  </motion.button>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleRemoveParticipant(selectedParticipant.id);
                      setSelectedParticipant(null);
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white`}
                  >
                    <FaTrash className="w-4 h-4" />
                    Retirer
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedParticipant(null)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GroupParticipants;
