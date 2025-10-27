import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUsers, FaLock, FaGlobe, FaShieldAlt, FaRocket, FaCrown, FaCoins, FaCamera, FaUpload, FaSave, FaUndo, FaUserFriends, FaEye, FaCheck, FaStar, FaFire, FaGem, FaBroadcastTower, FaClock, FaUserPlus, FaKey, FaEyeSlash, FaSearch, FaFilter, FaVolumeMute, FaVolumeUp, FaBell, FaBellSlash, FaMapMarkerAlt, FaPollH, FaMicrophone, FaVideo, FaDesktop, FaRecordVinyl, FaBroadcastTower as FaBroadcast, FaSmile, FaReply, FaShare, FaEdit, FaTrash, FaComment, FaHeart } from 'react-icons/fa';
import { useGroupStore, useGroupActions, GROUP_TYPES, PRIVACY_TYPES } from '../../../lib/groupStore';
import { useApp } from '../../Context/AppContext';

const GroupCreator = ({ onClose, onCreated }) => {
  const { theme } = useApp();
  const { createGroup } = useGroupStore();
  const { createPrivateGroup, createPublicGroup, createInstantRoom, createSecretGroup } = useGroupActions();
  
  const [step, setStep] = useState(1);
  const [groupType, setGroupType] = useState(GROUP_TYPES.PRIVATE);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    privacy: PRIVACY_TYPES.PRIVATE,
    avatar: null,
    coverImage: null,
    maxMembers: 100,
    allowInvites: true,
    requireApproval: false,
    allowLinkSharing: false,
    allowSearch: false,
    allowDiscovery: false,
    memberVisibility: 'members_only',
    messageVisibility: 'members_only',
    activityVisibility: 'members_only',
    inviteExpiry: 7,
    maxInvitesPerMember: 10,
    autoArchive: false,
    archiveAfter: 30,
    whitelist: [],
    blacklist: [],
    monetization: {
      enabled: false,
      type: 'pay_per_join',
      price: 5,
      currency: 'elite_coins',
      minPrice: 1,
      maxPrice: 100
    },
    features: {
      voiceChat: false,
      videoChat: false,
      screenShare: false,
      recording: false,
      liveStreaming: false,
      polls: false,
      reactions: false,
      location: false
    },
    permissions: {
      allowMedia: true,
      allowVoiceMessages: true,
      allowLocation: true,
      allowPolls: true,
      allowReactions: true,
      allowReplies: true,
      allowForwarding: true,
      allowEditing: true,
      allowDeletion: true
    },
    slowMode: false,
    slowModeInterval: 5
  });

  const fileInputRef = useRef();

  const groupTypes = [
    { 
      type: GROUP_TYPES.PRIVATE, 
      label: 'Groupe Privé', 
      icon: <FaLock />, 
      color: 'from-blue-500 to-indigo-500',
      description: 'Groupe privé avec invitation',
      features: ['Invitation requise', 'Contrôle total', 'Confidentialité maximale']
    },
    { 
      type: GROUP_TYPES.PUBLIC, 
      label: 'Groupe Public', 
      icon: <FaGlobe />, 
      color: 'from-green-500 to-emerald-500',
      description: 'Groupe public accessible à tous',
      features: ['Visible par tous', 'Adhésion libre', 'Découverte facile']
    },
    { 
      type: GROUP_TYPES.SECRET, 
      label: 'Groupe Secret', 
      icon: <FaShieldAlt />, 
      color: 'from-purple-500 to-pink-500',
      description: 'Groupe complètement caché',
      features: ['Invisible', 'Lien d\'accès', 'Confidentialité absolue']
    },
    { 
      type: GROUP_TYPES.INSTANT_ROOM, 
      label: 'Instant-Room', 
      icon: <FaRocket />, 
      color: 'from-red-500 to-orange-500',
      description: 'Salle temporaire avec fonctionnalités avancées',
      features: ['Durée limitée', 'Fonctionnalités avancées', 'Monétisation possible']
    },
    { 
      type: GROUP_TYPES.BROADCAST, 
      label: 'Canal de Diffusion', 
      icon: <FaBroadcastTower />, 
      color: 'from-orange-500 to-yellow-500',
      description: 'Canal unidirectionnel pour diffusions',
      features: ['Diffusion unidirectionnelle', 'Audience large', 'Contenu premium']
    }
  ];

  const privacyOptions = [
    { 
      value: PRIVACY_TYPES.PUBLIC, 
      label: 'Public', 
      icon: <FaGlobe />, 
      description: 'Visible par tous, accessible à tous',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      value: PRIVACY_TYPES.APPROVAL_REQUIRED, 
      label: 'Approbation requise', 
      icon: <FaUserFriends />, 
      description: 'Visible par tous, approbation nécessaire',
      color: 'from-orange-500 to-red-500'
    },
    { 
      value: PRIVACY_TYPES.PRIVATE, 
      label: 'Privé', 
      icon: <FaLock />, 
      description: 'Visible par invitation uniquement',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      value: PRIVACY_TYPES.SECRET, 
      label: 'Secret', 
      icon: <FaShieldAlt />, 
      description: 'Invisible, accès par lien uniquement',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const monetizationTypes = [
    { value: 'pay_per_join', label: 'Paiement par adhésion', icon: <FaUsers /> },
    { value: 'pay_per_message', label: 'Paiement par message', icon: <FaComment /> },
    { value: 'subscription', label: 'Abonnement', icon: <FaCrown /> },
    { value: 'donation', label: 'Don', icon: <FaHeart /> }
  ];

  const featureOptions = [
    { key: 'voiceChat', label: 'Chat vocal', icon: <FaMicrophone />, description: 'Permettre les appels vocaux' },
    { key: 'videoChat', label: 'Chat vidéo', icon: <FaVideo />, description: 'Permettre les appels vidéo' },
    { key: 'screenShare', label: 'Partage d\'écran', icon: <FaDesktop />, description: 'Permettre le partage d\'écran' },
    { key: 'recording', label: 'Enregistrement', icon: <FaRecordVinyl />, description: 'Permettre l\'enregistrement' },
    { key: 'liveStreaming', label: 'Diffusion en direct', icon: <FaBroadcast />, description: 'Permettre la diffusion' },
    { key: 'polls', label: 'Sondages', icon: <FaPollH />, description: 'Permettre les sondages' },
    { key: 'reactions', label: 'Réactions', icon: <FaSmile />, description: 'Permettre les réactions' },
    { key: 'location', label: 'Localisation', icon: <FaMapMarkerAlt />, description: 'Permettre le partage de localisation' }
  ];

  const permissionOptions = [
    { key: 'allowMedia', label: 'Médias', icon: <FaCamera /> },
    { key: 'allowVoiceMessages', label: 'Messages vocaux', icon: <FaMicrophone /> },
    { key: 'allowLocation', label: 'Localisation', icon: <FaMapMarkerAlt /> },
    { key: 'allowPolls', label: 'Sondages', icon: <FaPollH /> },
    { key: 'allowReactions', label: 'Réactions', icon: <FaSmile /> },
    { key: 'allowReplies', label: 'Réponses', icon: <FaReply /> },
    { key: 'allowForwarding', label: 'Transférer', icon: <FaShare /> },
    { key: 'allowEditing', label: 'Modifier', icon: <FaEdit /> },
    { key: 'allowDeletion', label: 'Supprimer', icon: <FaTrash /> }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setGroupData(prev => ({
        ...prev,
        avatar: URL.createObjectURL(file)
      }));
    }
  };

  const handleFeatureToggle = (featureKey) => {
    setGroupData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  const handlePermissionToggle = (permissionKey) => {
    setGroupData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey]
      }
    }));
  };

  const handleCreate = () => {
    let newGroup;
    
    switch (groupType) {
      case GROUP_TYPES.PRIVATE:
        newGroup = createPrivateGroup(groupData.name, groupData.description);
        break;
      case GROUP_TYPES.PUBLIC:
        newGroup = createPublicGroup(groupData.name, groupData.description, groupData.privacy);
        break;
      case GROUP_TYPES.INSTANT_ROOM:
        newGroup = createInstantRoom(groupData.name, groupData.description, groupData.monetization.enabled ? groupData.monetization : null);
        break;
      case GROUP_TYPES.SECRET:
        newGroup = createSecretGroup(groupData.name, groupData.description);
        break;
      default:
        newGroup = createPrivateGroup(groupData.name, groupData.description);
    }

    // Mettre à jour avec les paramètres spécifiques
    useGroupStore.getState().updateGroup(newGroup.id, {
      privacy: groupData.privacy,
      avatar: groupData.avatar,
      maxMembers: groupData.maxMembers,
      settings: {
        allowInvites: groupData.allowInvites,
        requireApproval: groupData.requireApproval,
        allowLinkSharing: groupData.allowLinkSharing,
        allowSearch: groupData.allowSearch,
        allowDiscovery: groupData.allowDiscovery,
        memberVisibility: groupData.memberVisibility,
        messageVisibility: groupData.messageVisibility,
        activityVisibility: groupData.activityVisibility,
        inviteExpiry: groupData.inviteExpiry,
        maxInvitesPerMember: groupData.maxInvitesPerMember,
        autoArchive: groupData.autoArchive,
        archiveAfter: groupData.archiveAfter,
        whitelist: groupData.whitelist,
        blacklist: groupData.blacklist,
        allowMedia: groupData.permissions.allowMedia,
        allowVoiceMessages: groupData.permissions.allowVoiceMessages,
        allowLocation: groupData.permissions.allowLocation,
        allowPolls: groupData.permissions.allowPolls,
        allowReactions: groupData.permissions.allowReactions,
        allowReplies: groupData.permissions.allowReplies,
        allowForwarding: groupData.permissions.allowForwarding,
        allowEditing: groupData.permissions.allowEditing,
        allowDeletion: groupData.permissions.allowDeletion,
        slowMode: groupData.slowMode,
        slowModeInterval: groupData.slowModeInterval
      },
      features: groupData.features,
      monetization: groupData.monetization.enabled ? groupData.monetization : null
    });

    onCreated(newGroup);
  };

  const canProceed = () => {
    return groupData.name.trim().length > 0 && groupData.description.trim().length > 0;
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
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-b ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <FaUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Créer un Groupe Elite</h2>
              <p className={`text-sm ${theme.secondaryText}`}>Étape {step} sur 4</p>
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

        {/* Progress Bar */}
        <div className={`relative z-10 h-1 bg-gray-200 ${theme.borderColor}`}>
          <motion.div
            className={`h-full ${theme.accentBg} rounded-r-full`}
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choisissez le type de groupe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupTypes.map((type) => (
                      <motion.button
                        key={type.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGroupType(type.type)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          groupType === type.type
                            ? `border-amber-500 bg-gradient-to-r ${type.color} text-white shadow-lg`
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
                  <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom du groupe *</label>
                      <input
                        type="text"
                        value={groupData.name}
                        onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom de votre groupe..."
                        className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={groupData.description}
                        onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre groupe..."
                        rows={3}
                        className={`w-full p-4 rounded-xl border ${theme.borderColor} ${theme.inputBg} resize-none focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Avatar (optionnel)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {groupData.avatar ? (
                        <div className="relative">
                          <img src={groupData.avatar} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setGroupData(prev => ({ ...prev, avatar: null }))}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                          >
                            <FaTimes className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-32 h-32 border-2 border-dashed ${theme.borderColor} rounded-xl ${theme.itemHover} transition-all duration-200 flex items-center justify-center`}
                        >
                          <FaUpload className="w-8 h-8 text-gray-400" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Confidentialité et accès</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Niveau de confidentialité</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {privacyOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setGroupData(prev => ({ ...prev, privacy: option.value }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              groupData.privacy === option.value
                                ? `border-amber-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nombre maximum de membres</label>
                        <input
                          type="number"
                          min="2"
                          max="1000"
                          value={groupData.maxMembers}
                          onChange={(e) => setGroupData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                          className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Expiration des invitations (jours)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={groupData.inviteExpiry}
                          onChange={(e) => setGroupData(prev => ({ ...prev, inviteExpiry: parseInt(e.target.value) }))}
                          className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={groupData.allowInvites}
                          onChange={(e) => setGroupData(prev => ({ ...prev, allowInvites: e.target.checked }))}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                        />
                        <span>Autoriser les invitations</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={groupData.requireApproval}
                          onChange={(e) => setGroupData(prev => ({ ...prev, requireApproval: e.target.checked }))}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                        />
                        <span>Exiger une approbation pour rejoindre</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={groupData.allowLinkSharing}
                          onChange={(e) => setGroupData(prev => ({ ...prev, allowLinkSharing: e.target.checked }))}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                        />
                        <span>Autoriser le partage de lien</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fonctionnalités et permissions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">Fonctionnalités avancées</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {featureOptions.map((feature) => (
                          <motion.button
                            key={feature.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleFeatureToggle(feature.key)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              groupData.features[feature.key]
                                ? `border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg`
                                : `${theme.borderColor} ${theme.itemHover}`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{feature.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{feature.label}</div>
                                <div className="text-sm opacity-80">{feature.description}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Permissions de messages</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissionOptions.map((permission) => (
                          <label key={permission.key} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={groupData.permissions[permission.key]}
                              onChange={() => handlePermissionToggle(permission.key)}
                              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                            />
                            <span className="text-lg">{permission.icon}</span>
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={groupData.slowMode}
                          onChange={(e) => setGroupData(prev => ({ ...prev, slowMode: e.target.checked }))}
                          className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                        />
                        <span>Mode lent (limiter la fréquence des messages)</span>
                      </label>
                      {groupData.slowMode && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Intervalle (secondes)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={groupData.slowModeInterval}
                            onChange={(e) => setGroupData(prev => ({ ...prev, slowModeInterval: parseInt(e.target.value) }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monétisation (optionnel)</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={groupData.monetization.enabled}
                        onChange={(e) => setGroupData(prev => ({ 
                          ...prev, 
                          monetization: { ...prev.monetization, enabled: e.target.checked }
                        }))}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <div className="flex items-center gap-2">
                        <FaCoins className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Activer la monétisation</span>
                      </div>
                    </label>

                    {groupData.monetization.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">Type de monétisation</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {monetizationTypes.map((type) => (
                              <motion.button
                                key={type.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setGroupData(prev => ({ 
                                  ...prev, 
                                  monetization: { ...prev.monetization, type: type.value }
                                }))}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  groupData.monetization.type === type.value
                                    ? `border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg`
                                    : `${theme.borderColor} ${theme.itemHover}`
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Prix (Elite-Coins)</label>
                          <input
                            type="number"
                            min={groupData.monetization.minPrice}
                            max={groupData.monetization.maxPrice}
                            value={groupData.monetization.price}
                            onChange={(e) => setGroupData(prev => ({ 
                              ...prev, 
                              monetization: { ...prev.monetization, price: parseInt(e.target.value) }
                            }))}
                            className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.inputBg} focus:outline-none focus:ring-2 ${theme.focusRing}`}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Prix entre {groupData.monetization.minPrice} et {groupData.monetization.maxPrice} Elite-Coins
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
                  <div className={`p-4 rounded-xl border ${theme.borderColor} ${theme.itemHover}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{groupData.name}</span>
                          <span className="text-sm text-gray-500">• {groupTypes.find(t => t.type === groupType)?.label}</span>
                          {privacyOptions.find(p => p.value === groupData.privacy)?.icon}
                          {groupData.monetization.enabled && (
                            <div className="flex items-center gap-1">
                              <FaCoins className="w-4 h-4 text-yellow-500" />
                              <FaGem className="w-3 h-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {groupData.description}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUsers className="w-3 h-3" />
                            <span>Max {groupData.maxMembers} membres</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FaKey className="w-3 h-3" />
                            <span>{privacyOptions.find(p => p.value === groupData.privacy)?.label}</span>
                          </span>
                          {groupData.monetization.enabled && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <FaCoins className="w-3 h-3" />
                              <span>{groupData.monetization.price} Elite-Coins</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`relative z-10 flex items-center justify-between p-6 border-t ${theme.borderColor} bg-gradient-to-r ${theme.headerBg} backdrop-blur-sm`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              step === 1
                ? 'opacity-50 cursor-not-allowed'
                : `${theme.buttonSecondary} ${theme.buttonHover}`
            }`}
          >
            Précédent
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => step < 4 ? setStep(step + 1) : handleCreate()}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              canProceed()
                ? `${theme.buttonGold} shadow-lg ${theme.accentShadow}`
                : 'opacity-50 cursor-not-allowed bg-gray-300'
            }`}
          >
            {step === 4 ? (
              <>
                <FaSave className="w-4 h-4 inline mr-2" />
                Créer le groupe
              </>
            ) : (
              'Suivant'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GroupCreator;
