import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUsers, FaUserPlus, FaSearch, FaCheck, FaTimes as FaX, FaUser, FaUserFriends, FaEnvelope, FaCopy, FaShare, FaCheckCircle } from 'react-icons/fa';
import { useApp } from '../../Context/AppContext';

const GroupInvite = ({ group, onClose }) => {
  const { theme } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLink, setInviteLink] = useState(`https://elite.app/join/${group.id}`);

  // Mock contacts data
  const contacts = [
    {
      id: 'contact_1',
      name: 'Alice Martin',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Martin&background=ec4899&color=fff',
      isOnline: true,
      isVerified: true,
      isElite: true
    },
    {
      id: 'contact_2',
      name: 'Bob Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=8b5cf6&color=fff',
      isOnline: false,
      isVerified: true,
      isElite: false
    },
    {
      id: 'contact_3',
      name: 'Charlie Brown',
      avatar: 'https://ui-avatars.com/api/?name=Charlie+Brown&background=3b82f6&color=fff',
      isOnline: true,
      isVerified: false,
      isElite: false
    },
    {
      id: 'contact_4',
      name: 'Diana Prince',
      avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=10b981&color=fff',
      isOnline: false,
      isVerified: true,
      isElite: true
    },
    {
      id: 'contact_5',
      name: 'Eve Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Eve+Johnson&background=f59e0b&color=fff',
      isOnline: true,
      isVerified: false,
      isElite: false
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactToggle = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  const handleSendInvites = () => {
    // TODO: Send invites to selected contacts
    console.log('Sending invites to:', selectedContacts);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    // TODO: Show success notification
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Rejoignez ${group.name} sur Elite`,
        text: `Venez rejoindre notre groupe "${group.name}" sur Elite !`,
        url: inviteLink
      });
    } else {
      handleCopyLink();
    }
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
              <FaUserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.textColor}`}>Inviter des membres</h2>
              <p className={`text-sm ${theme.secondaryText}`}>{group.name} • {selectedContacts.length} sélectionné{selectedContacts.length > 1 ? 's' : ''}</p>
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

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Invite Link Section */}
            <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <div className="flex items-center gap-3 mb-4">
                <FaEnvelope className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Lien d'invitation</h3>
              </div>
              <p className="text-sm opacity-90 mb-4">
                Partagez ce lien pour inviter des personnes à rejoindre votre groupe
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                >
                  <FaCopy className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareLink}
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                >
                  <FaShare className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Contact Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme.textColor}`}>Sélectionner des contacts</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSelectAll}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedContacts.length === filteredContacts.length
                      ? `${theme.buttonSecondary} ${theme.buttonHover}`
                      : `${theme.buttonGold} text-white shadow-lg`
                  }`}
                >
                  {selectedContacts.length === filteredContacts.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </motion.button>
              </div>

              <div className="relative mb-4">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.secondaryText}`} />
                <input
                  type="text"
                  placeholder="Rechercher des contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                      selectedContacts.includes(contact.id)
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'shadow-md hover:shadow-lg'
                    } ${
                      theme === 'dark' 
                        ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50' 
                        : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
                    }`}
                    onClick={() => handleContactToggle(contact.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={contact.avatar} 
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover shadow-lg"
                        />
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${theme.textColor}`}>{contact.name}</h4>
                          {contact.isVerified && (
                            <FaCheck className="w-4 h-4 text-blue-500" title="Vérifié" />
                          )}
                          {contact.isElite && (
                            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">E</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`${contact.isOnline ? 'text-green-500' : theme.secondaryText}`}>
                            {contact.isOnline ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedContacts.includes(contact.id) ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <FaCheck className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Invite Message */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>
                Message d'invitation (optionnel)
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Ajoutez un message personnel à votre invitation..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                maxLength={200}
              />
              <p className={`text-xs mt-1 ${theme.secondaryText}`}>
                {inviteMessage.length}/200 caractères
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-4 text-sm">
            <span className={`${theme.secondaryText}`}>
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
            </span>
            <span className={`${theme.secondaryText}`}>
              {filteredContacts.length} contact{filteredContacts.length > 1 ? 's' : ''} trouvé{filteredContacts.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
            >
              Annuler
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendInvites}
              disabled={selectedContacts.length === 0}
              className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedContacts.length > 0
                  ? `${theme.buttonGold} text-white shadow-lg`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaUserPlus className="w-4 h-4" />
              Envoyer les invitations ({selectedContacts.length})
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupInvite;
