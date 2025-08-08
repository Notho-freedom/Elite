import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaLock, FaGlobe, FaShieldAlt, FaUserFriends, FaEye, FaEyeSlash, FaUsers, FaUserPlus, FaUserCheck, FaUserTimes, FaLink, FaCopy, FaQrcode, FaCog, FaSave, FaUndo, FaCheck, FaBan, FaClock, FaCalendar, FaKey, FaUnlock, FaSearch, FaFilter } from 'react-icons/fa';
import { useGroupStore, PRIVACY_TYPES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const GroupPrivacyManager = ({ group, onClose, onUpdate, isCompact = false }) => {
  const { theme } = useApp();
  const { updateGroup } = useGroupStore();
  
  const [privacySettings, setPrivacySettings] = useState({
    type: group.privacy || PRIVACY_TYPES.PRIVATE,
    visibility: group.visibility || 'visible',
    joinMethod: group.joinMethod || 'invite_only',
    approvalRequired: group.settings?.requireApproval || false,
    allowInvites: group.settings?.allowInvites || true,
    allowLinkSharing: group.settings?.allowLinkSharing || false,
    allowSearch: group.settings?.allowSearch || false,
    allowDiscovery: group.settings?.allowDiscovery || false,
    memberVisibility: group.settings?.memberVisibility || 'members_only',
    messageVisibility: group.settings?.messageVisibility || 'members_only',
    activityVisibility: group.settings?.activityVisibility || 'members_only',
    inviteExpiry: group.settings?.inviteExpiry || 7, // jours
    maxInvitesPerMember: group.settings?.maxInvitesPerMember || 10,
    autoArchive: group.settings?.autoArchive || false,
    archiveAfter: group.settings?.archiveAfter || 30, // jours
    whitelist: group.settings?.whitelist || [],
    blacklist: group.settings?.blacklist || []
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [newWhitelistUser, setNewWhitelistUser] = useState('');
  const [newBlacklistUser, setNewBlacklistUser] = useState('');

  const privacyTypes = [
    {
      value: PRIVACY_TYPES.PUBLIC,
      label: 'Public',
      icon: <FaGlobe />,
      description: 'Visible par tous, accessible à tous',
      color: 'from-green-500 to-emerald-500',
      features: ['Visible dans la recherche', 'Accessible à tous', 'Messages publics']
    },
    {
      value: PRIVACY_TYPES.APPROVAL_REQUIRED,
      label: 'Approbation requise',
      icon: <FaUserFriends />,
      description: 'Visible par tous, approbation nécessaire',
      color: 'from-orange-500 to-red-500',
      features: ['Visible dans la recherche', 'Demande d\'adhésion requise', 'Approbation manuelle']
    },
    {
      value: PRIVACY_TYPES.PRIVATE,
      label: 'Privé',
      icon: <FaLock />,
      description: 'Visible par invitation uniquement',
      color: 'from-blue-500 to-indigo-500',
      features: ['Invisible dans la recherche', 'Invitation requise', 'Contrôle total']
    },
    {
      value: PRIVACY_TYPES.SECRET,
      label: 'Secret',
      icon: <FaShieldAlt />,
      description: 'Invisible, accès par lien uniquement',
      color: 'from-purple-500 to-pink-500',
      features: ['Complètement invisible', 'Lien d\'accès uniquement', 'Confidentialité maximale']
    }
  ];

  const visibilityOptions = [
    { value: 'visible', label: 'Visible', icon: <FaEye />, description: 'Le groupe est visible' },
    { value: 'hidden', label: 'Caché', icon: <FaEyeSlash />, description: 'Le groupe est caché' }
  ];

  const joinMethods = [
    { value: 'open', label: 'Ouvert', icon: <FaUserPlus />, description: 'Tout le monde peut rejoindre' },
    { value: 'approval', label: 'Avec approbation', icon: <FaUserCheck />, description: 'Approbation requise' },
    { value: 'invite_only', label: 'Invitation uniquement', icon: <FaKey />, description: 'Invitation obligatoire' }
  ];

  const memberVisibilityOptions = [
    { value: 'public', label: 'Public', icon: <FaGlobe />, description: 'Liste des membres visible par tous' },
    { value: 'members_only', label: 'Membres uniquement', icon: <FaUsers />, description: 'Liste visible par les membres' },
    { value: 'admins_only', label: 'Admins uniquement', icon: <FaShieldAlt />, description: 'Liste visible par les admins' }
  ];

  const handleSave = () => {
    const updatedGroup = {
      ...group,
      privacy: privacySettings.type,
      visibility: privacySettings.visibility,
      joinMethod: privacySettings.joinMethod,
      settings: {
        ...group.settings,
        requireApproval: privacySettings.approvalRequired,
        allowInvites: privacySettings.allowInvites,
        allowLinkSharing: privacySettings.allowLinkSharing,
        allowSearch: privacySettings.allowSearch,
        allowDiscovery: privacySettings.allowDiscovery,
        memberVisibility: privacySettings.memberVisibility,
        messageVisibility: privacySettings.messageVisibility,
        activityVisibility: privacySettings.activityVisibility,
        inviteExpiry: privacySettings.inviteExpiry,
        maxInvitesPerMember: privacySettings.maxInvitesPerMember,
        autoArchive: privacySettings.autoArchive,
        archiveAfter: privacySettings.archiveAfter,
        whitelist: privacySettings.whitelist,
        blacklist: privacySettings.blacklist
      }
    };

    updateGroup(group.id, updatedGroup);
    onUpdate(updatedGroup);
    onClose();
  };

  const handleReset = () => {
    setPrivacySettings({
      type: group.privacy || PRIVACY_TYPES.PRIVATE,
      visibility: group.visibility || 'visible',
      joinMethod: group.joinMethod || 'invite_only',
      approvalRequired: group.settings?.requireApproval || false,
      allowInvites: group.settings?.allowInvites || true,
      allowLinkSharing: group.settings?.allowLinkSharing || false,
      allowSearch: group.settings?.allowSearch || false,
      allowDiscovery: group.settings?.allowDiscovery || false,
      memberVisibility: group.settings?.memberVisibility || 'members_only',
      messageVisibility: group.settings?.messageVisibility || 'members_only',
      activityVisibility: group.settings?.activityVisibility || 'members_only',
      inviteExpiry: group.settings?.inviteExpiry || 7,
      maxInvitesPerMember: group.settings?.maxInvitesPerMember || 10,
      autoArchive: group.settings?.autoArchive || false,
      archiveAfter: group.settings?.archiveAfter || 30,
      whitelist: group.settings?.whitelist || [],
      blacklist: group.settings?.blacklist || []
    });
  };

  const addToWhitelist = () => {
    if (newWhitelistUser.trim() && !privacySettings.whitelist.includes(newWhitelistUser.trim())) {
      setPrivacySettings(prev => ({
        ...prev,
        whitelist: [...prev.whitelist, newWhitelistUser.trim()]
      }));
      setNewWhitelistUser('');
    }
  };

  const removeFromWhitelist = (user) => {
    setPrivacySettings(prev => ({
      ...prev,
      whitelist: prev.whitelist.filter(u => u !== user)
    }));
  };

  const addToBlacklist = () => {
    if (newBlacklistUser.trim() && !privacySettings.blacklist.includes(newBlacklistUser.trim())) {
      setPrivacySettings(prev => ({
        ...prev,
        blacklist: [...prev.blacklist, newBlacklistUser.trim()]
      }));
      setNewBlacklistUser('');
    }
  };

  const removeFromBlacklist = (user) => {
    setPrivacySettings(prev => ({
      ...prev,
      blacklist: prev.blacklist.filter(u => u !== user)
    }));
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: <FaCog /> },
    { id: 'access', label: 'Accès', icon: <FaKey /> },
    { id: 'visibility', label: 'Visibilité', icon: <FaEye /> },
    { id: 'lists', label: 'Listes', icon: <FaUsers /> },
    { id: 'advanced', label: 'Avancé', icon: <FaShieldAlt /> }
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Type de confidentialité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPrivacySettings(prev => ({ ...prev, type: type.value }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                privacySettings.type === type.value
                  ? `border-orange-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
                  : `${theme.borderColor} ${theme.itemHover}`
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-lg">{type.label}</div>
                  <div className="text-sm opacity-80 mb-2">{type.description}</div>
                  <ul className="text-xs space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <FaCheck className="w-3 h-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Visibilité du groupe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibilityOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPrivacySettings(prev => ({ ...prev, visibility: option.value }))}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                privacySettings.visibility === option.value
                  ? `border-orange-500 ${theme.accentBg} text-white`
                  : `${theme.borderColor} ${theme.itemHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccessTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Méthode d'adhésion</h3>
        <div className="space-y-3">
          {joinMethods.map((method) => (
            <motion.button
              key={method.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPrivacySettings(prev => ({ ...prev, joinMethod: method.value }))}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                privacySettings.joinMethod === method.value
                  ? `border-orange-500 ${theme.accentBg} text-white`
                  : `${theme.borderColor} ${theme.itemHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{method.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm opacity-80">{method.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options d'invitation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Expiration des invitations (jours)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={privacySettings.inviteExpiry}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, inviteExpiry: parseInt(e.target.value) }))}
              className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max invitations par membre</label>
            <input
              type="number"
              min="1"
              max="100"
              value={privacySettings.maxInvitesPerMember}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, maxInvitesPerMember: parseInt(e.target.value) }))}
              className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.allowInvites}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowInvites: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            />
            <span>Autoriser les invitations</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.allowLinkSharing}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowLinkSharing: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            />
            <span>Autoriser le partage de lien</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderVisibilityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Visibilité des membres</h3>
        <div className="space-y-3">
          {memberVisibilityOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPrivacySettings(prev => ({ ...prev, memberVisibility: option.value }))}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                privacySettings.memberVisibility === option.value
                  ? `border-orange-500 ${theme.accentBg} text-white`
                  : `${theme.borderColor} ${theme.itemHover}`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options de découverte</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.allowSearch}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowSearch: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            />
            <span>Autoriser la recherche</span>
          </label>
          
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.allowDiscovery}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowDiscovery: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            />
            <span>Apparaître dans les suggestions</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderListsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liste blanche</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWhitelistUser}
              onChange={(e) => setNewWhitelistUser(e.target.value)}
              placeholder="Nom d'utilisateur ou email"
              className={`flex-1 p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addToWhitelist}
              className={`px-4 py-3 rounded-lg ${theme.accentBg} text-white font-medium`}
            >
              <FaUserPlus className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            {privacySettings.whitelist.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">{user}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromWhitelist(user)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <FaTimes className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Liste noire</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newBlacklistUser}
              onChange={(e) => setNewBlacklistUser(e.target.value)}
              placeholder="Nom d'utilisateur ou email"
              className={`flex-1 p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addToBlacklist}
              className={`px-4 py-3 rounded-lg ${theme.accentBg} text-white font-medium`}
            >
              <FaBan className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-2">
            {privacySettings.blacklist.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="font-medium">{user}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromBlacklist(user)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <FaTimes className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Archivage automatique</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.autoArchive}
              onChange={(e) => setPrivacySettings(prev => ({ ...prev, autoArchive: e.target.checked }))}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            />
            <span>Archiver automatiquement après inactivité</span>
          </label>
          
          {privacySettings.autoArchive && (
            <div>
              <label className="block text-sm font-medium mb-2">Délai d'archivage (jours)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={privacySettings.archiveAfter}
                onChange={(e) => setPrivacySettings(prev => ({ ...prev, archiveAfter: parseInt(e.target.value) }))}
                className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Résumé des paramètres</h3>
        <div className={`p-4 rounded-xl border ${theme.borderColor} ${theme.itemHover}`}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <span>{privacyTypes.find(t => t.value === privacySettings.type)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Visibilité:</span>
              <span>{visibilityOptions.find(v => v.value === privacySettings.visibility)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Adhésion:</span>
              <span>{joinMethods.find(j => j.value === privacySettings.joinMethod)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Membres visibles:</span>
              <span>{memberVisibilityOptions.find(m => m.value === privacySettings.memberVisibility)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Liste blanche:</span>
              <span>{privacySettings.whitelist.length} utilisateur(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Liste noire:</span>
              <span>{privacySettings.blacklist.length} utilisateur(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Version compacte pour le panel droit
  if (isCompact) {
    return (
      <div className={`h-full flex flex-col ${theme.bgColor} ${theme.textColor}`}>
        {/* Header compact */}
        <div className={`flex items-center justify-between p-4 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${theme.accentBg} flex items-center justify-center`}>
              <FaShieldAlt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Confidentialité</h3>
              <p className={`text-xs ${theme.secondaryText}`}>{group.name}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.buttonSecondary} ${theme.buttonHover}`}
          >
            <FaTimes className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Tabs compact */}
        <div className={`flex border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-center relative transition-all text-xs ${
                activeTab === tab.id
                  ? `${theme.goldText} font-semibold`
                  : `${theme.secondaryText} ${theme.filterHover}`
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme.accentBg} rounded-t-full`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content compact */}
        <div className="flex-1 overflow-y-auto p-3">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold mb-3">Type de confidentialité</h4>
                  <div className="space-y-2">
                    {privacyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, type: type.value }))}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          privacySettings.type === type.value
                            ? `border-orange-500 bg-gradient-to-r ${type.color} text-white`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs opacity-80">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Visibilité</h4>
                  <div className="space-y-2">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, visibility: option.value }))}
                        className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                          privacySettings.visibility === option.value
                            ? `border-orange-500 ${theme.accentBg} text-white`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{option.icon}</span>
                          <div>
                            <div className="font-medium text-xs">{option.label}</div>
                            <div className="text-xs opacity-80">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'access' && (
              <motion.div
                key="access"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold mb-3">Méthode d'adhésion</h4>
                  <div className="space-y-2">
                    {joinMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, joinMethod: method.value }))}
                        className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                          privacySettings.joinMethod === method.value
                            ? `border-orange-500 ${theme.accentBg} text-white`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{method.icon}</span>
                          <div>
                            <div className="font-medium text-xs">{method.label}</div>
                            <div className="text-xs opacity-80">{method.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Options d'invitation</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Expiration (jours)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={privacySettings.inviteExpiry}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, inviteExpiry: parseInt(e.target.value) }))}
                        className={`w-full p-2 text-xs rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.focusRing}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Max par membre</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={privacySettings.maxInvitesPerMember}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, maxInvitesPerMember: parseInt(e.target.value) }))}
                        className={`w-full p-2 text-xs rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.focusRing}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowInvites}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowInvites: e.target.checked }))}
                        className="w-3 h-3 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <span>Autoriser les invitations</span>
                    </label>
                    
                    <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowLinkSharing}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowLinkSharing: e.target.checked }))}
                        className="w-3 h-3 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <span>Autoriser le partage de lien</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'visibility' && (
              <motion.div
                key="visibility"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold mb-3">Visibilité des membres</h4>
                  <div className="space-y-2">
                    {memberVisibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, memberVisibility: option.value }))}
                        className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                          privacySettings.memberVisibility === option.value
                            ? `border-orange-500 ${theme.accentBg} text-white`
                            : `${theme.borderColor} ${theme.itemHover}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{option.icon}</span>
                          <div>
                            <div className="font-medium text-xs">{option.label}</div>
                            <div className="text-xs opacity-80">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Options de découverte</h4>
                  
                  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowSearch}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowSearch: e.target.checked }))}
                      className="w-3 h-3 text-orange-500 rounded focus:ring-orange-400"
                    />
                    <span>Autoriser la recherche</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowDiscovery}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowDiscovery: e.target.checked }))}
                      className="w-3 h-3 text-orange-500 rounded focus:ring-orange-400"
                    />
                    <span>Apparaître dans les suggestions</span>
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div
                key="lists"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold mb-3">Liste blanche</h4>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newWhitelistUser}
                        onChange={(e) => setNewWhitelistUser(e.target.value)}
                        placeholder="Utilisateur"
                        className={`flex-1 p-2 text-xs rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.focusRing}`}
                      />
                      <button
                        onClick={addToWhitelist}
                        className={`px-3 py-2 rounded-lg ${theme.accentBg} text-white text-xs font-medium`}
                      >
                        <FaUserPlus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {privacySettings.whitelist.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
                          <span className="text-xs font-medium">{user}</span>
                          <button
                            onClick={() => removeFromWhitelist(user)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded text-xs"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Liste noire</h4>
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newBlacklistUser}
                        onChange={(e) => setNewBlacklistUser(e.target.value)}
                        placeholder="Utilisateur"
                        className={`flex-1 p-2 text-xs rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.focusRing}`}
                      />
                      <button
                        onClick={addToBlacklist}
                        className={`px-3 py-2 rounded-lg ${theme.accentBg} text-white text-xs font-medium`}
                      >
                        <FaBan className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {privacySettings.blacklist.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                          <span className="text-xs font-medium">{user}</span>
                          <button
                            onClick={() => removeFromBlacklist(user)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded text-xs"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold mb-3">Archivage automatique</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                      <input
                        type="checkbox"
                        checked={privacySettings.autoArchive}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, autoArchive: e.target.checked }))}
                        className="w-3 h-3 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <span>Archiver automatiquement après inactivité</span>
                    </label>
                    
                    {privacySettings.autoArchive && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Délai d'archivage (jours)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={privacySettings.archiveAfter}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, archiveAfter: parseInt(e.target.value) }))}
                          className={`w-full p-2 text-xs rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.focusRing}`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Résumé</h4>
                  <div className={`p-3 rounded-lg border ${theme.borderColor} ${theme.itemHover} text-xs space-y-1`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span>{privacyTypes.find(t => t.value === privacySettings.type)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Visibilité:</span>
                      <span>{visibilityOptions.find(v => v.value === privacySettings.visibility)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Adhésion:</span>
                      <span>{joinMethods.find(j => j.value === privacySettings.joinMethod)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Liste blanche:</span>
                      <span>{privacySettings.whitelist.length} utilisateur(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Liste noire:</span>
                      <span>{privacySettings.blacklist.length} utilisateur(s)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer compact */}
        <div className={`p-3 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg}`}>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${theme.buttonSecondary} ${theme.buttonHover}`}
            >
              <FaUndo className="w-3 h-3 inline mr-1" />
              Reset
            </motion.button>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${theme.buttonSecondary} ${theme.buttonHover}`}
              >
                Annuler
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${theme.buttonGold} shadow-lg ${theme.accentShadow}`}
              >
                <FaSave className="w-3 h-3 inline mr-1" />
                Enregistrer
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Version originale (modale plein écran)
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
        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaShieldAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gestion de la confidentialité</h2>
              <p className={`text-sm ${theme.secondaryText}`}>{group.name}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-xl ${theme.buttonSecondary} ${theme.buttonHover} transition-all duration-200`}
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
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderGeneralTab()}
              </motion.div>
            )}

            {activeTab === 'access' && (
              <motion.div
                key="access"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderAccessTab()}
              </motion.div>
            )}

            {activeTab === 'visibility' && (
              <motion.div
                key="visibility"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderVisibilityTab()}
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div
                key="lists"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderListsTab()}
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderAdvancedTab()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
          >
            <FaUndo className="w-4 h-4 inline mr-2" />
            Réinitialiser
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.buttonSecondary} ${theme.buttonHover}`}
            >
              Annuler
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${theme.buttonGold} shadow-lg ${theme.accentShadow}`}
            >
              <FaSave className="w-4 h-4 inline mr-2" />
              Enregistrer
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupPrivacyManager;
