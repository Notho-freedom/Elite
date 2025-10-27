import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaUsers, FaLock, FaGlobe, FaShieldAlt, FaCog, FaBell, FaEye, FaUserFriends, FaCheck, FaSave, FaUndo, FaTrash, FaArchive, FaVolumeMute, FaVolumeUp, FaCoins, FaGem } from 'react-icons/fa';
import { useGroupStore, PRIVACY_TYPES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const GroupSettings = ({ onClose }) => {
  const { theme } = useApp();
  const { settings, updateSettings } = useGroupStore();
  
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);

  const tabs = [
    { id: 'general', label: 'Général', icon: <FaCog /> },
    { id: 'privacy', label: 'Confidentialité', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'monetization', label: 'Monétisation', icon: <FaCoins /> }
  ];

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const privacyOptions = [
    {
      value: PRIVACY_TYPES.PUBLIC,
      label: 'Public',
      description: 'Visible et rejoignable par tous',
      icon: <FaGlobe />,
      color: 'text-green-500'
    },
    {
      value: PRIVACY_TYPES.PRIVATE,
      label: 'Privé',
      description: 'Visible mais nécessite une invitation',
      icon: <FaLock />,
      color: 'text-blue-500'
    },
    {
      value: PRIVACY_TYPES.SECRET,
      label: 'Secret',
      description: 'Invisible et invitation uniquement',
      icon: <FaShieldAlt />,
      color: 'text-purple-500'
    },
    {
      value: PRIVACY_TYPES.INVITE_ONLY,
      label: 'Invitation uniquement',
      description: 'Invitation requise pour rejoindre',
      icon: <FaUserFriends />,
      color: 'text-orange-500'
    },
    {
      value: PRIVACY_TYPES.APPROVAL_REQUIRED,
      label: 'Approbation requise',
      description: 'Demande d\'adhésion avec approbation',
      icon: <FaEye />,
      color: 'text-yellow-500'
    }
  ];

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
              <FaCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.textColor}`}>Paramètres des Groupes</h2>
              <p className={`text-sm ${theme.secondaryText}`}>Configurez vos préférences de groupes</p>
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
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>Paramètres généraux</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Autoriser les invitations de groupes</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Permettre aux utilisateurs d'inviter d'autres personnes dans leurs groupes</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ ...prev, allowGroupInvites: !prev.allowGroupInvites }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.allowGroupInvites ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.allowGroupInvites ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Autoriser les groupes publics</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Permettre la création de groupes visibles par tous</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ ...prev, allowPublicGroups: !prev.allowPublicGroups }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.allowPublicGroups ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.allowPublicGroups ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Autoriser les Instant-Rooms</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Permettre la création de salles de discussion temporaires</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ ...prev, allowInstantRooms: !prev.allowInstantRooms }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.allowInstantRooms ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.allowInstantRooms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Archivage automatique</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Archiver automatiquement les groupes inactifs</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ ...prev, autoArchiveInactive: !prev.autoArchiveInactive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.autoArchiveInactive ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.autoArchiveInactive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>Nombre max de groupes par utilisateur</label>
                    <select
                      value={localSettings.maxGroupsPerUser}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, maxGroupsPerUser: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                    >
                      <option value={5}>5 groupes</option>
                      <option value={10}>10 groupes</option>
                      <option value={20}>20 groupes</option>
                      <option value={50}>50 groupes</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>Nombre max de membres par groupe</label>
                    <select
                      value={localSettings.maxMembersPerGroup}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, maxMembersPerGroup: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                    >
                      <option value={100}>100 membres</option>
                      <option value={500}>500 membres</option>
                      <option value={1000}>1000 membres</option>
                      <option value={5000}>5000 membres</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>Paramètres de confidentialité</h3>
                
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${theme.textColor}`}>Confidentialité par défaut</label>
                  <div className="grid gap-3">
                    {privacyOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setLocalSettings(prev => ({ ...prev, defaultPrivacy: option.value }))}
                        className={`p-4 rounded-xl text-left transition-all duration-200 ${
                          localSettings.defaultPrivacy === option.value
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : 'shadow-md hover:shadow-lg'
                        } ${
                          theme === 'dark' 
                            ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50' 
                            : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xl ${option.color}`}>{option.icon}</span>
                          <div>
                            <h4 className={`font-medium ${theme.textColor}`}>{option.label}</h4>
                            <p className={`text-sm ${theme.secondaryText}`}>{option.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Archivage après inactivité</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Archiver les groupes après une période d'inactivité</p>
                    </div>
                    <select
                      value={localSettings.archiveAfterDays}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, archiveAfterDays: parseInt(e.target.value) }))}
                      className={`px-4 py-2 rounded-xl border transition-all duration-200 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputFocus}`}
                    >
                      <option value={7}>7 jours</option>
                      <option value={30}>30 jours</option>
                      <option value={90}>90 jours</option>
                      <option value={180}>180 jours</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>Paramètres de notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Nouveaux messages</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Recevoir des notifications pour les nouveaux messages</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, newMessages: !prev.notifications.newMessages }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.notifications.newMessages ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.notifications.newMessages ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Mentions</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Recevoir des notifications pour les mentions</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, mentions: !prev.notifications.mentions }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.notifications.mentions ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.notifications.mentions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Réactions</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Recevoir des notifications pour les réactions</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, reactions: !prev.notifications.reactions }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.notifications.reactions ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.notifications.reactions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Demandes d'adhésion</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Recevoir des notifications pour les demandes d'adhésion</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, joinRequests: !prev.notifications.joinRequests }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.notifications.joinRequests ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.notifications.joinRequests ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div>
                      <h5 className={`font-medium ${theme.textColor}`}>Mises à jour de groupe</h5>
                      <p className={`text-sm ${theme.secondaryText}`}>Recevoir des notifications pour les mises à jour de groupe</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalSettings(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, groupUpdates: !prev.notifications.groupUpdates }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.notifications.groupUpdates ? theme.accentBg : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.notifications.groupUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'monetization' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme.textColor}`}>Paramètres de monétisation</h3>
                
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCoins className="w-6 h-6" />
                      <h4 className="text-lg font-semibold">Monétisation Elite</h4>
                    </div>
                    <p className="text-sm opacity-90">
                      Configurez les paramètres de monétisation pour vos groupes et Instant-Rooms.
                      Gagnez des Elite-Coins en créant du contenu premium.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <FaGem className="w-5 h-5 text-purple-500" />
                        <h5 className={`font-medium ${theme.textColor}`}>Contenu Premium</h5>
                      </div>
                      <p className={`text-sm ${theme.secondaryText} mb-3`}>
                        Créez du contenu exclusif accessible uniquement aux membres payants
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <FaCheck className="w-3 h-3 text-green-500" />
                        <span className={theme.secondaryText}>Contenu exclusif</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <FaCheck className="w-3 h-3 text-green-500" />
                        <span className={theme.secondaryText}>Monétisation directe</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <FaCoins className="w-5 h-5 text-yellow-500" />
                        <h5 className={`font-medium ${theme.textColor}`}>Instant-Rooms</h5>
                      </div>
                      <p className={`text-sm ${theme.secondaryText} mb-3`}>
                        Créez des salles de discussion temporaires avec accès payant
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <FaCheck className="w-3 h-3 text-green-500" />
                        <span className={theme.secondaryText}>Accès temporaire</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <FaCheck className="w-3 h-3 text-green-500" />
                        <span className={theme.secondaryText}>Paiement à l'entrée</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <h5 className={`font-medium mb-3 ${theme.textColor}`}>Statistiques de monétisation</h5>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.goldText}`}>0</div>
                        <div className={`text-sm ${theme.secondaryText}`}>Elite-Coins gagnés</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textColor}`}>0</div>
                        <div className={`text-sm ${theme.secondaryText}`}>Groupes monétisés</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textColor}`}>0</div>
                        <div className={`text-sm ${theme.secondaryText}`}>Membres payants</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${theme.buttonSecondary} ${theme.buttonHover}`}
          >
            <FaUndo className="w-4 h-4" />
            Réinitialiser
          </motion.button>

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
              onClick={handleSave}
              className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${theme.buttonGold} text-white shadow-lg`}
            >
              <FaSave className="w-4 h-4" />
              Enregistrer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupSettings;
